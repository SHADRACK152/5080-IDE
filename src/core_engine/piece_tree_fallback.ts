export enum EventType {
  InsertChar = 0,
  Backspace = 1,
  ViewportScroll = 2
}

interface Piece {
  type: "Original" | "Append";
  offset: number;
  length: number;
}

export class EditorCoreFallback {
  private pieces: Piece[] = [];
  private originalContent = "";
  private appendContent = "";
  private isRunning = false;
  private lastIndex = -1;
  private lastAccumulated = 0;

  constructor() {
    this.pieces = [];
    this.lastIndex = -1;
    this.lastAccumulated = 0;
  }

  init(originalContent: string): void {
    this.originalContent = originalContent;
    this.appendContent = "";
    this.pieces = [];
    this.lastIndex = -1;
    this.lastAccumulated = 0;
    if (originalContent && originalContent.length > 0) {
      this.pieces.push({
        type: "Original",
        offset: 0,
        length: originalContent.length,
      });
    }
  }

  start(): boolean {
    this.isRunning = true;
    return true;
  }

  stop(): boolean {
    this.isRunning = false;
    return true;
  }

  pushEvent(event: any): boolean {
    if (!event) return false;

    if (event.type === EventType.InsertChar) {
      const text = event.text || "";
      const offset = typeof event.offset === "number" ? event.offset : this.totalLogicalLength();
      
      const appendOffset = this.appendContent.length;
      this.appendContent += text;
      
      this.insert(offset, appendOffset, text.length);
    } else if (event.type === EventType.Backspace) {
      const offset = typeof event.offset === "number" ? event.offset : this.totalLogicalLength();
      const count = event.count || 1;
      this.backspace(offset, count);
    }
    return true;
  }

  private findPieceIndex(logicalOffset: number): { index: number; accumulated: number } {
    const len = this.pieces.length;
    if (len === 0) return { index: -1, accumulated: 0 };

    if (this.lastIndex >= 0 && this.lastIndex < len) {
      let acc = this.lastAccumulated;
      let piece = this.pieces[this.lastIndex];
      if (logicalOffset >= acc && logicalOffset <= acc + piece.length) {
        return { index: this.lastIndex, accumulated: acc };
      }

      if (this.lastIndex + 1 < len) {
        acc += piece.length;
        piece = this.pieces[this.lastIndex + 1];
        if (logicalOffset >= acc && logicalOffset <= acc + piece.length) {
          this.lastIndex = this.lastIndex + 1;
          this.lastAccumulated = acc;
          return { index: this.lastIndex, accumulated: acc };
        }
      }
    }

    let accumulated = 0;
    for (let i = 0; i < len; i++) {
      const piece = this.pieces[i];
      if (logicalOffset >= accumulated && logicalOffset <= accumulated + piece.length) {
        this.lastIndex = i;
        this.lastAccumulated = accumulated;
        return { index: i, accumulated };
      }
      accumulated += piece.length;
    }

    return { index: -1, accumulated };
  }

  private insert(logicalOffset: number, appendOffset: number, length: number): void {
    if (length <= 0) return;

    const { index, accumulated } = this.findPieceIndex(logicalOffset);

    if (index === -1) {
      this.pieces.push({ type: "Append", offset: appendOffset, length });
      this.lastIndex = this.pieces.length - 1;
      this.lastAccumulated = accumulated;
      return;
    }

    const piece = this.pieces[index];
    const offsetWithinPiece = logicalOffset - accumulated;

    if (offsetWithinPiece === 0) {
      this.pieces.splice(index, 0, { type: "Append", offset: appendOffset, length });
      this.lastIndex = -1;
    } else if (offsetWithinPiece === piece.length) {
      this.pieces.splice(index + 1, 0, { type: "Append", offset: appendOffset, length });
      this.lastIndex = -1;
    } else {
      const leftLen = offsetWithinPiece;
      const rightLen = piece.length - leftLen;

      const leftPiece: Piece = { type: piece.type, offset: piece.offset, length: leftLen };
      const middlePiece: Piece = { type: "Append", offset: appendOffset, length };
      const rightPiece: Piece = { type: piece.type, offset: piece.offset + leftLen, length: rightLen };

      this.pieces.splice(index, 1, leftPiece, middlePiece, rightPiece);
      this.lastIndex = -1;
    }
  }

  private backspace(logicalOffset: number, count: number): void {
    if (count <= 0 || logicalOffset <= 0) return;
    this.lastIndex = -1; // Reset cache on delete

    // A simple deletion mechanism for Piece Table simulator
    let startDel = Math.max(0, logicalOffset - count);
    let remainingToDel = logicalOffset - startDel;

    let accumulated = 0;
    let i = 0;

    while (i < this.pieces.length && remainingToDel > 0) {
      const piece = this.pieces[i];
      if (startDel >= accumulated && startDel < accumulated + piece.length) {
        const offsetWithinPiece = startDel - accumulated;
        const availableInPiece = piece.length - offsetWithinPiece;
        const deleteFromThisPiece = Math.min(availableInPiece, remainingToDel);

        if (offsetWithinPiece === 0) {
          if (deleteFromThisPiece === piece.length) {
            this.pieces.splice(i, 1);
            // Don't advance i since we deleted
          } else {
            piece.offset += deleteFromThisPiece;
            piece.length -= deleteFromThisPiece;
            i++;
          }
        } else {
          if (offsetWithinPiece + deleteFromThisPiece === piece.length) {
            piece.length = offsetWithinPiece;
            i++;
          } else {
            // Split the piece leaving a gap
            const leftPiece: Piece = { type: piece.type, offset: piece.offset, length: offsetWithinPiece };
            const rightPiece: Piece = { 
              type: piece.type, 
              offset: piece.offset + offsetWithinPiece + deleteFromThisPiece, 
              length: piece.length - offsetWithinPiece - deleteFromThisPiece 
            };
            this.pieces.splice(i, 1, leftPiece, rightPiece);
            i += 2;
          }
        }
        remainingToDel -= deleteFromThisPiece;
      } else {
        accumulated += piece.length;
        i++;
      }
    }
  }

  getText(): string {
    let result = "";
    for (const piece of this.pieces) {
      if (piece.type === "Original") {
        result += this.originalContent.substring(piece.offset, piece.offset + piece.length);
      } else {
        result += this.appendContent.substring(piece.offset, piece.offset + piece.length);
      }
    }
    return result;
  }

  totalLogicalLength(): number {
    return this.pieces.reduce((sum, p) => sum + p.length, 0);
  }
}
