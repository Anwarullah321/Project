import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
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
   statusSet?: boolean;
}
@Component({
  selector: 'app-externaluser',
  templateUrl: './externaluser.component.html',
  styleUrls: ['./externaluser.component.css']
})
export class WelcomeComponent {
  searchEmail: string = '';
  files: Array<{
    email: string; 
    name: string, 
    type: string, 
    requestedBy: string, 
    status: string,
    internalUserName: string,
    statusSet: boolean,
  }> = [];
  filteredFiles: Array<{
    email: string; 
    name: string, 
    type: string, 
    requestedBy: string, 
    status: string,
    internalUserName: string,
    statusSet: boolean,}> = [];
  externalUserEmails: string[]; // Explicitly declare as an array of strings
  loggedInUserEmail!: string;
  constructor(private cdr: ChangeDetectorRef, private router: Router, private http: HttpClient) {
    this.externalUserEmails = JSON.parse(localStorage.getItem('externalUserEmails') || '["defaultEmail@example.com"]');
    console.log('External User Email:', this.externalUserEmails);
  }
  searchFiles() {
    console.log('Searching for files submitted by:', this.searchEmail);
    this.filteredFiles = this.files.filter(file => file.email.toLowerCase().includes(this.searchEmail.toLowerCase()));
    console.log('Filtered files:', this.filteredFiles);
 }
   
   
   
  logout() {
    // Clear user data from local storage
    //localStorage.clear();
 
    this.router.navigate(['/login']); 
 }

 ngOnInit() {
  this.http.get<any>('http://localhost:8080/api/external/getAllFiles').subscribe(
     (response: any) => {
       if (response && response.data && Array.isArray(response.data)) {
         this.files = response.data.map((file: {
           senderName: string; email: any; name: any; type: any; userId: any; status: any; internalUserName: any; statusSet: any; 
}) => ({
           email: file.email,
           name: file.name,
           type: file.type,
           requestedBy: file.userId,
           status: file.status || 'defaultStatus',
           internalUserName: file.senderName || 'defaultUserName', // This should now display the internal user's email
           statusSet: file.statusSet || false,
         }));
         this.filteredFiles = [...this.files];
         this.cdr.detectChanges();
       } else {
         console.error('API response does not contain a data array:', response);
       }
     },
     error => {
       console.error('Error fetching files:', error);
     }
  );
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
               statusSet: file.statusSet || false,
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
       // Check if the status has already been set
       if (this.files[index].statusSet) {
         console.log('Status has already been set. No further changes allowed.');
         return; // Exit the method if the status has already been set
       }
   
       this.files[index].status = newStatus; // Update the status in the component's state
       this.files[index].statusSet = true; // Mark the status as set
   
       const key = `userFiles_${file.requestedBy}`;
       console.log('Local storage key:', key);
       const storedFiles = JSON.parse(localStorage.getItem(key) || '[]');
       console.log('Stored files before update:', storedFiles);
       const updatedFiles = storedFiles.map((f: FileData) => {
         console.log('Checking file:', f.name, 'internal ', f.email, 'external',f.submittedToEmails);
         if (f.name === file.name && f.email === file.email && f.submittedToEmails.includes(externalUserEmail)) {
           return { ...f, status: newStatus, statusSet: true }; // Update the statusSet property
         }
         return f;
       });
       console.log('Updated file data:', updatedFiles);
       localStorage.setItem(key, JSON.stringify(updatedFiles));
       console.log('Stored files after update:', JSON.parse(localStorage.getItem(key) || '[]'));
    }
   }
   
   
   

   

}