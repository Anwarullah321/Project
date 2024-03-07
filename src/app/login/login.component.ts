//login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginObj = {
    email: '',
    password: ''
  };
  signupUsers: any[] = []; // Initialize as an empty array

  constructor(private router: Router) {}

  ngOnInit(): void {
    const localData = localStorage.getItem('signUpUsers');
    if (localData) {
      try {
        this.signupUsers = JSON.parse(localData);
      } catch (error) {
        console.error('Error parsing local storage data:', error);
        // Clear or reset `signupUsers` appropriately
       // this.signupUsers = [];
      }
    }
  }

  onLogin() {
    const isUserExist = this.signupUsers.find((user) =>
      user.email === this.loginObj.email && user.password === this.loginObj.password
    );
  
    if (isUserExist) {
      console.log('User found:', isUserExist);
      // Check if the user has a role of 'internal' or 'external'
      if (isUserExist.role === 'internal' || isUserExist.role === 'external') {
        // Use the id from the found user object as the userId
        const userId = isUserExist.id;
        if (userId) {
          // Store the userId in localStorage
          localStorage.setItem('userId', userId.toString());
          // Navigate to the appropriate page based on the user's role
          localStorage.setItem('userEmail', isUserExist.email);
          if (isUserExist.role === 'internal') {
            
            this.router.navigate(['/internalwelcome']);
          } else if (isUserExist.role === 'external') {
            localStorage.setItem('externaluser', isUserExist.email);
            this.router.navigate(['/welcome']);
          }
        } else {
          alert('User ID not found for the logged-in user.');
        }
      } else {
        // If the user is an admin, navigate to the admin page without setting a userId
        this.router.navigate(['/admin']);
      }
    } else {
      alert('Invalid credentials or user not found.');
    }
  }
  
  
  
  private generateUniqueUserId(): string {
    // Implement a method to generate a unique ID for each user
    // This could be a UUID, a combination of the user's email and a timestamp, etc.
    // For simplicity, we'll use a random string here
    return Math.random().toString(36).substring(2,  15) + Math.random().toString(36).substring(2,  15);
  }
}
