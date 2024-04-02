import { Component, ViewChild, ElementRef } from '@angular/core';
import  html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.css']
})
export class SignaturePadComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  signatureColor: string = '#000000';
  bgColor: string = '#ffffff';
  context: CanvasRenderingContext2D | null = null;
  isDrawing: boolean = false;
  selectedFormat: string = 'png';

  ngAfterViewInit() {
    this.initializeCanvas();
  }

  initializeCanvas() {
    if (this.canvas.nativeElement) {
      this.context = this.canvas.nativeElement.getContext('2d');
      if (this.context) {
        this.context.fillStyle = this.bgColor;
        this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        this.context.lineWidth = 2;
        this.context.lineCap = 'round';
        this.addEventListeners();
      } else {
        console.error('Unable to get canvas context.');
      }
    }
  }

  addEventListeners() {
    if (this.canvas.nativeElement) {
      this.canvas.nativeElement.addEventListener('mousedown', (event) => this.startDrawing(event));
      this.canvas.nativeElement.addEventListener('mousemove', (event) => this.draw(event));
      this.canvas.nativeElement.addEventListener('mouseup', () => this.endDrawing());
      this.canvas.nativeElement.addEventListener('mouseleave', () => this.endDrawing());
      // For touch devices
      this.canvas.nativeElement.addEventListener('touchstart', (event) => this.startDrawing(event));
      this.canvas.nativeElement.addEventListener('touchmove', (event) => this.draw(event));
      this.canvas.nativeElement.addEventListener('touchend', () => this.endDrawing());
    }
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    this.isDrawing = true;
    const { offsetX, offsetY } = this.getCoordinates(event);
    if (this.context) {
      this.context.beginPath();
      this.context.moveTo(offsetX, offsetY);
      this.context.strokeStyle = this.signatureColor;
    }
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    const { offsetX, offsetY } = this.getCoordinates(event);
    if (this.context) {
      this.context.lineTo(offsetX, offsetY);
      this.context.stroke();
    }
  }

  endDrawing() {
    this.isDrawing = false;
  }

  getCoordinates(event: MouseEvent | TouchEvent) {
    let offsetX, offsetY;
    if ('touches' in event) {
      const touch = event.touches[0];
      offsetX = touch.pageX - this.canvas.nativeElement.getBoundingClientRect().left;
      offsetY = touch.pageY - this.canvas.nativeElement.getBoundingClientRect().top;
    } else {
      offsetX = (event as MouseEvent).offsetX;
      offsetY = (event as MouseEvent).offsetY;
    }
    return { offsetX, offsetY };
  }

  clearCanvas() {
    if (this.context && this.canvas.nativeElement) {
      this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.context.fillStyle = this.bgColor;
      this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    } else {
      console.error('Canvas context or element is null.');
    }
  }

  updateSignatureColor() {
    if (this.context) {
      this.context.strokeStyle = this.signatureColor;
    }
  }

  updateBackgroundColor() {
    if (this.context) {
      this.context.fillStyle = this.bgColor;
      this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }
  }

  download() {
    if (this.selectedFormat === 'png') {
      this.downloadPNG();
    } else if (this.selectedFormat === 'jpg') {
      this.downloadJPG();
    } else if (this.selectedFormat === 'pdf') {
      this.downloadPDF();
    }
  }

  downloadPNG() {
    if (this.canvas.nativeElement) {
      const dataUrl = this.canvas.nativeElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'signature.png';
      link.click();
    }
  }

  downloadJPG() {
    if (this.canvas.nativeElement) {
      const dataUrl = this.canvas.nativeElement.toDataURL('image/jpeg');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'signature.jpg';
      link.click();
    }
  }

  downloadPDF() {
    if (this.canvas.nativeElement) {
      html2canvas(this.canvas.nativeElement).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg');
        const doc = new jsPDF();
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        doc.addImage(imgData, 'JPEG', 0, 0, width, height);
        doc.save('signature.pdf');
      });
    }
  }
  
}
