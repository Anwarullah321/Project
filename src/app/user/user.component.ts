// user.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userForm: FormGroup = this.formBuilder.group({ // Provide a default value
    email: '',
    password: '',
    role: 'external' // Default role
  });

  
  constructor(private formBuilder: FormBuilder, private router: Router) {} 

  ngOnInit() {
   
  }
  createUser() {
    console.log('Selected role before creating user:', this.userForm.value.role);
    const userRole = this.userForm.value.role;
    const userId = userRole === 'internal' || userRole === 'external' ? Date.now() : null;

    let userEmail; // Variable to store the user's email

    // If the user is internal, use the provided email
    if (userRole === 'internal') {
      userEmail = this.userForm.value.email;
    } else {
      // If the user is external, generate a placeholder email
      userEmail = `external_user_${userId}@example.com`;
    }

    const userData = {
      id: userId, // Only include 'id' if the role is 'internal' or 'external'
      email: userEmail,
      ...this.userForm.value
    };
    
    console.log('User data after creating user:', userData);
    // Save user data to local storage
    if (userId) {
      localStorage.setItem(`user_${userId}`, JSON.stringify(userData));
    }
    localStorage.setItem('userEmail', userData.email);
    let signUpUsers = JSON.parse(localStorage.getItem('signUpUsers') || '[]');
    signUpUsers.push(userData);
    localStorage.setItem('signUpUsers', JSON.stringify(signUpUsers));
    // Optionally, clear the form
    this.userForm.reset();
    this.router.navigate(['/admin']);
  }
  
  
}
