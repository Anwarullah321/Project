//internalwelcome.component.ts(internal user)
import { ChangeDetectorRef, Component } from '@angular/core';
interface FileData {
  name: string;
  type: string;
  lastModified: number;
  size: number;
  data: File;
  submitted: boolean;
  userId: string; // Add a property for the user ID
  documentName?: string; // Add this line
  internalUserName?: string;
  status: string;
  email: string;
  submittedToEmails: string[];
}
@Component({
  selector: 'app-internaluser',
  templateUrl: './internaluser.component.html',
  styleUrls: ['./internaluser.component.css']
})
export class InternalwelcomeComponent {
    files: FileList | null = null;
    uploadedFiles: any[] = [];
    submittedFiles: any[] = [];
    isSubmitted = false;
    userId: string; 
    allFiles: FileData[] = [];
    documentName: string = '';
    externalUserName: string = '';
    showModal: boolean = false;
    selectedExternalUsers: string[] = []; // Define selectedExternalUsers property
    externalUsers: { email: string }[] = []; // Define externalUsers property

    constructor(private cdr: ChangeDetectorRef) {
      this.userId = localStorage.getItem('userId') || 'defaultUserId';
      console.log('User ID:', this.userId);
      
    }

    getStatusColor(status: string): string {
      switch (status) {
         case 'New':
           return '#007bff'; // Light blue for "New"
         case 'Approved':
           return '#28a745'; // Green for "Approve"
         case 'Rejected':
           return '#dc3545'; // Red for "Reject"
         default:
           return '#6c757d'; // A neutral grey for default or unrecognized statuses
      }
     }
     

     
    onSubmitClick() {
      console.log('Submit button clicked');
      
      // Assuming the document name is the name of the first uploaded file
      if (this.uploadedFiles.length >  0) {
        this.documentName = this.uploadedFiles[0].name;
        console.log('Document name:', this.documentName);
      }
      this.showModal = true;
    }
    ngOnInit() {
      this.loadSubmittedFiles();
      this.getExternalUsers(); 
      console.log(this.allFiles);
      //this.viewAllFiles();
    }
    getExternalUsers() {
      const signUpUsers = JSON.parse(localStorage.getItem('signUpUsers') || '[]');
      this.externalUsers = signUpUsers.filter((user: { role: string }) => user.role === 'external');

      console.log('External Users:', this.externalUsers);
    }
    cancel() {
      // Reset form or close modal
      this.showModal = false;
      
      // Reset other form fields as needed
     }
     
    onFileSelected(event: Event) {
      const target = event.target as HTMLInputElement;
      this.files = target.files;
      if (this.files) {
        this.uploadedFiles = Array.from(this.files).map(file => ({
          name: file.name,
          type: file.type,
          lastModified: file.lastModified,
          size: file.size,
          data: file,
          submitted: true,
          userId: this.userId,
          status: 'New',
        }));
        console.log('Uploaded files:', this.uploadedFiles); 
        
      }
    }
  
    submitFiles(documentName: string, externalUserName: string,) {
      const userEmail = this.getUserEmail(this.userId);
      console.log("useremail and userid: ", userEmail, this.userId);
      if (!externalUserName) {
         alert('Please select email before submitting the file.');
         return; // Exit the method if the internal user name is not provided
      }
     
      // Assuming externalUserName is a string of emails separated by commas
      const externalUserEmails = externalUserName.split(',').map(email => email.trim());
     
      // Retrieve the existing list of emails from localStorage
      let storedEmails = JSON.parse(localStorage.getItem('externalUserEmails') || '[]');
     
      // Add new emails to the existing list
      storedEmails = [...storedEmails, ...externalUserEmails];
     
      // Remove duplicates (optional, if you want to ensure each email is unique)
      storedEmails = [...new Set(storedEmails)];
     
      // Store the updated list back in localStorage
      localStorage.setItem('externalUserEmails', JSON.stringify(storedEmails));
     
      console.log('External User Name:', externalUserName);
      const externalUserNames = externalUserName.split(',').map(username => username.trim());
     
      // Filter out any files that have already been submitted to the same external user
      const newFiles = this.uploadedFiles.filter(file => {
         // Check if the file has already been submitted to any of the selected external users
         const alreadySubmittedToExternalUser = externalUserNames.some(externalUserEmail => {
           return this.submittedFiles.some(f => f.name === file.name && f.submittedToEmails.includes(externalUserEmail));
         });
         return !alreadySubmittedToExternalUser;
      });
     
      if (newFiles.length > 0) {
         const userFilesKey = `userFiles_${this.userId}`;
     
         let existingUserFiles = JSON.parse(localStorage.getItem(userFilesKey) || '[]');
         console.log("Existing user files: ", existingUserFiles);
         const externalUserEmails = externalUserName.split(',').map(username => username.trim());
     
         newFiles.forEach((file: FileData) => {
           file.documentName = documentName;
           file.internalUserName = userEmail;
           file.email = userEmail;
           file.submittedToEmails = externalUserEmails;
           console.log("submittedtoemails is: ", file.submittedToEmails);
         });
     
         existingUserFiles = existingUserFiles.concat(newFiles);
         localStorage.setItem(userFilesKey, JSON.stringify(existingUserFiles));
         console.log('existing user files are: ', existingUserFiles);
         const storedFiles = localStorage.getItem(userFilesKey);
         if (storedFiles) {
           console.log('Files stored in localStorage:', JSON.parse(storedFiles));
         } else {
           console.error('Failed to store files in localStorage.');
         }
         // Update the submittedFiles array to include the new files
         this.submittedFiles.push(...newFiles);
      }
      this.submittedFiles = this.uploadedFiles;
      // Clear the uploadedFiles array
      this.uploadedFiles = [];
     
      // Save the updated submittedFiles array to localStorage
      this.saveSubmittedFiles();
     
      // Indicate that the files have been submitted
      this.isSubmitted = true;
     }
     
     
     

    private getUserEmail(userId: string): string {
      const allUserData = JSON.parse(localStorage.getItem('signUpUsers') || '[]');
      console.log("signUpUsers:", allUserData);
    
      const user = allUserData.find((user: any) => {
        console.log("Checking user:", user);
        console.log("userId:", user.userId);
        return user.id === parseInt(userId);
      });
    
      console.log("user is :", user);
      if (user) {
        return user.email || 'Email not found';
      } else {
        return 'Email not found';
      }
    }
    
    
    

    viewSubmittedFiles() {
      const userFilesKey = `userFiles_${this.userId}`;
      console.log('view submitted file is ', userFilesKey);
      const storedFiles = localStorage.getItem(userFilesKey);
      console.log('view stored file: ', storedFiles);
      if (storedFiles) {
        try {
          const allFiles: FileData[] = JSON.parse(storedFiles);
          this.submittedFiles = allFiles.filter((file: FileData) => file.userId === this.userId);
          this.submittedFiles.forEach((file: FileData) => {
            const url = URL.createObjectURL(file.data);
            window.open(url, '_blank');
          });
        } catch (error) {
          console.error('Error loading submitted files:', error);
          this.submittedFiles = [];
        }
      }
    }
  


    viewAllFiles() {
      const userFilesKey = `userFiles_${this.userId}`;
      console.log("user found", userFilesKey);
      const storedFiles = localStorage.getItem(userFilesKey);
      console.log("user stored", storedFiles);
      if (storedFiles) {
         try {
           const filesFromStorage = JSON.parse(storedFiles);
           // Filter out duplicate files based on their name and user ID
           const allFiles: FileData[] = JSON.parse(storedFiles);
           // Display all files, including duplicates submitted to different users
           this.allFiles = allFiles;
           console.log('Retrieved files from localStorage:', this.allFiles);
         } catch (error) {
           console.error('Error loading all files:', error);
         }
      } else {
         console.log('No files found in localStorage.');
      }
     }
     
    
    private getUniqueFiles(files: any[]): any[] {
      const uniqueFilesMap = new Map<string, any>();
      // Add files to a map using their name and user ID as a key
      files.forEach(file => {
        const key = `${file.name}-${file.userId}`;
        if (!uniqueFilesMap.has(key)) {
          uniqueFilesMap.set(key, file);
        }
      });
      // Convert the map back to an array of unique files
      return Array.from(uniqueFilesMap.values());
    }
    
  viewFile(file: any) {
 if (file.data instanceof Blob) {
    // Create a URL for the Blob object
    const url = URL.createObjectURL(file.data);
    // Open the URL in a new window or tab
    window.open(url, '_blank');
    // Optionally, revoke the URL to free up memory
    URL.revokeObjectURL(url);
 } else if (typeof file.data === 'string') {
    // If file.data is a URL, directly open it
    window.open(file.data, '_blank');
 } else {
    console.error('Unsupported file data format:', file.data);
 }
}

  
  private loadSubmittedFiles() {
    const userFilesKey = `userFiles_${this.userId}`;
    console.log("Attempting to load submitted files with key: ", userFilesKey);
    const storedFiles = localStorage.getItem(userFilesKey);
    console.log("Retrieved data: ",storedFiles);
    //const storedFiles = localStorage.getItem('submittedFiles');
    console.log("data is loaded", storedFiles);
    if (storedFiles) {
        try {
          const allFiles: FileData[] = JSON.parse(storedFiles);
          const userSpecificFiles = allFiles.filter(file => file.userId === this.userId);
          console.log(this.allFiles);
          this.submittedFiles = [...userSpecificFiles]; //.filter((file: FileData) => file.userId === this.userId);
          console.log('Filtered submittedFiles length:', this.submittedFiles.length);
      console.log('Filtered submittedFiles:', this.submittedFiles);
          this.cdr.detectChanges();  
        } catch (error) {
            console.error('Error loading submitted files:', error);
            // Handle the error, e.g., by setting submittedFiles to an empty array
          //  this.submittedFiles = [];
          }
    }
  }

  private saveSubmittedFiles() {
    const userFilesKey = `userFiles_${this.userId}`;
    try {
        localStorage.setItem('submittedFiles', JSON.stringify(this.submittedFiles));
      } catch (error) {
        console.error('Error saving submitted files:', error);
      }
  }
  deleteFile(file: any) {
    const index = this.allFiles.indexOf(file);
    if (index !== -1) {
      this.allFiles.splice(index, 1);
      const userFilesKey = `userFiles_${this.userId}`;
      let existingUserFiles = JSON.parse(localStorage.getItem(userFilesKey) || '[]');
      existingUserFiles.splice(index, 1);
      localStorage.setItem(userFilesKey, JSON.stringify(existingUserFiles));
    
  }
  }

  handleAction(event: Event, file: FileData) {
    const action = (event.target as HTMLSelectElement).value;
    if (action) {
       // Update the file's status based on the selected action
       file.status = action;
   
       // Update the file in localStorage
       const userFilesKey = `userFiles_${this.userId}`;
       let existingUserFiles = JSON.parse(localStorage.getItem(userFilesKey) || '[]');
       const updatedFiles = existingUserFiles.map((f: { name: string; }) => f.name === file.name ? { ...f, status: action } : f);
       localStorage.setItem(userFilesKey, JSON.stringify(updatedFiles));
   
       // Optionally, refresh the view
       this.cdr.detectChanges();
    }
   }
   
  
}

