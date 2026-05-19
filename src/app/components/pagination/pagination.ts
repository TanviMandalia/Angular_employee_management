import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class Pagination implements OnChanges {

  @Input() users: any[] = [];

  @Output() paginatedUsers = new EventEmitter<any[]>();

  currentPage = 1;
  itemsPerPage = 8;

  ngOnChanges() {
    this.sendPaginatedData();
  }

  sendPaginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    setTimeout(() => { //if remove setTimeout then first record data is not show and also not show the delete text into button.
      this.paginatedUsers.emit(
        this.users.slice(start, end)
      );
    });

  }


  getTotalPages() {
    return Math.ceil(
      this.users.length / this.itemsPerPage
    );
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.sendPaginatedData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.sendPaginatedData();
    }
  }
}