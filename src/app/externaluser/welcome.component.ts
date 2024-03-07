import { ChangeDetectorRef, Component } from '@angular/core';
interface FileData {
  name: string;
  type: string;
  lastModified: number;
  size: number;
  data: File;
  submitted: boolean;
  userId: string;
  documentName?: string;
  internalUserName?: string;
   status?: string; 
   email: string;
   submittedToEmails: string[];
}
@Component({
  selector: 'app-externaluser',
  templateUrl: './externaluser.component.html',
  styleUrls: ['./externaluser.component.css']
})
export class WelcomeComponent {
  files: Array<{
    email: string; 
    name: string, 
    type: string, 
    requestedBy: string, 
    status: string,
    internalUserName: string,
  }> = [];
  externalUserEmails: string[]; // Explicitly declare as an array of strings
  loggedInUserEmail!: string;
  constructor(private cdr: ChangeDetectorRef) {
    this.externalUserEmails = JSON.parse(localStorage.getItem('externalUserEmails') || '["defaultEmail@example.com"]');
    console.log('External User Email:', this.externalUserEmails);
  }

  ngOnInit() {
     this.loggedInUserEmail = localStorage.getItem('userEmail') || '';
    console.log('the user email is: ',this.loggedInUserEmail);
    const externalUserEmails = JSON.parse(localStorage.getItem('externalUserEmails') || '[]');
  
    if (!this.loggedInUserEmail || externalUserEmails.length === 0) {
      console.error('No logged-in user email or external user emails found!');
      // Handle the case where no user or emails are available (e.g., display appropriate message)
      return; // Exit the function early if there's nothing to filter
    }
    const isExternalUser = externalUserEmails.includes(this.loggedInUserEmail);
    console.log('is External user: ',isExternalUser);
    this.retrieveAllFiles(isExternalUser, this.loggedInUserEmail);
    console.log('External User Email in ngOnInit:', this.externalUserEmails);
    this.cdr.detectChanges();
  }

  retrieveAllFiles(isExternalUser: boolean, loggedInUserEmail: string) {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('userFiles_'));
    this.files = [];
   
    keys.forEach(key => {
       const storedFiles = localStorage.getItem(key);
   
       if (storedFiles) {
         try {
           const filesFromStorage = JSON.parse(storedFiles);
   
           const filesForCurrentUser = filesFromStorage.filter((file: FileData) => {
             if (isExternalUser) {
               return file.submittedToEmails && file.submittedToEmails.includes(loggedInUserEmail);
             } else {
               // Existing filtering logic for internal users
               return /* ... existing filtering logic based on submittedToEmails ... */;
             }
           });
   
           console.log(`Files for ${isExternalUser ? 'external' : 'internal'} user from key ${key}:`, filesForCurrentUser.length);
   
           // Process and map files
           filesForCurrentUser.forEach((file: FileData) => {
             // Assuming the structure of this.files is based on the properties you've shown
         
             const processedFile = {
               email: file.email,
               name: file.name,
               type: file.type,
               requestedBy: file.userId, // Assuming this is the correct property for requestedBy
               status: file.status || 'defaultStatus', // Provide a default status if not available
               internalUserName: file.internalUserName || 'defaultUserName', // Provide a default internalUserName if not available
             };
             this.files.push(processedFile);
           });
   
         } catch (error) {
           console.error('Error loading files:', error);
         }
       } else {
         console.log(`No files found in localStorage for key ${key}.`);
       }
    });
   
    console.log('Total files for current user:', this.files);
   }
   
  
   updateFileStatus(file: { email: string; name: string; type: string; requestedBy: string; status: string; internalUserName: string; }, newStatus: string, externalUserEmail: string) {
    console.log('Updating file status:', file, newStatus);
    const index = this.files.findIndex(f => f.email === file.email && f.name === file.name);
    
    if (index !== -1) {
       console.log('Found file to update:', this.files[index]);
       this.files[index].status = newStatus; // Update the status in the component's state
       const key = `userFiles_${file.requestedBy}`;
       console.log('Local storage key:', key);
       const storedFiles = JSON.parse(localStorage.getItem(key) || '[]');
       console.log('Stored files before update:', storedFiles);
       const updatedFiles = storedFiles.map((f: FileData) => {
        console.log('Checking file:', f.name, 'internal ', f.email, 'external',f.submittedToEmails);
         if (f.name === file.name && f.email === file.email && f.submittedToEmails.includes( externalUserEmail)) {
           return { ...f, status: newStatus };
         }
         return f;
       });
       console.log('Updated file data:', updatedFiles);
       localStorage.setItem(key, JSON.stringify(updatedFiles));
       console.log('Stored files after update:', JSON.parse(localStorage.getItem(key) || '[]'));
    }
   }
   

   

}