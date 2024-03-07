// admin.component.ts

import { Component } from '@angular/core';
import { User } from '../user/user.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserComponent } from '../user/user.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  users: User[] = [];
  selectedUser: User | null = null; // Add this property
  showUpdateForm = false; // 

  constructor(private dialog: MatDialog) {
    
    this.loadUsers();
  }
  
  openCreateUserDialog() {
    const dialogRef = this.dialog.open(UserComponent, {
       width: '400px',
       data: {} // Pass any data you need to the dialog here
    });
   
    dialogRef.afterClosed().subscribe(result => {
       console.log('The dialog was closed');
       // Handle the result of the dialog here, e.g., refresh the user list
       this.loadUsers();
    });
   }
   
  cancelUpdate() {
    this.selectedUser = null;
    this.showUpdateForm = false;
 }
  loadUsers() {
    this.users = [];
    // Retrieve user data from local storage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        const userData = JSON.parse(localStorage.getItem(key)!);
        this.users.push(userData);
      }
    }
  }
  selectUserForUpdate(user: User) {
    this.selectedUser = { ...user }; // Create a copy of the user object
    this.showUpdateForm = true;
  }
  updateUser() {
    this.users = [];
    if (this.selectedUser) {
      const userId = this.selectedUser.id;
      const key = `user_${userId}`;
      if (localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(this.selectedUser));
        // Update the user in the 'signUpUsers' array as well
        let signUpUsers = JSON.parse(localStorage.getItem('signUpUsers') || '[]');
        const index = signUpUsers.findIndex((user: { id: number; }) => user.id === userId);
        if (index !== -1) {
          signUpUsers[index] = this.selectedUser;
          localStorage.setItem('signUpUsers', JSON.stringify(signUpUsers));
        }
        // Refresh the list of users
        this.loadUsers();
         this.selectedUser = null;
        this.showUpdateForm = false;
      }
    }
  }
  deleteUser(userId: number) {
    if (userId === undefined) {
      console.error('User ID is undefined. Cannot delete user.');
      return;
    }
    // Logic to delete the user
    // This could involve confirming the action and then removing the user from local storage
    if (confirm('Are you sure you want to delete this user?')) {
      const key = `user_${userId}`;
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        // Remove the user from the 'signUpUsers' array as well
        let signUpUsers = JSON.parse(localStorage.getItem('signUpUsers') || '[]');
        const index = signUpUsers.findIndex((user: { id: number; }) => user.id === userId);
        if (index !== -1) {
          signUpUsers.splice(index,  1);
          localStorage.setItem('signUpUsers', JSON.stringify(signUpUsers));
        }
        // Refresh the list of users
        this.loadUsers();
      }
    }
  }
}
