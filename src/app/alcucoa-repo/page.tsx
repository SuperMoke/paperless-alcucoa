'use client'
import React,{ useState, useEffect } from 'react';
import Navbar from './navbar';
import FileUploader from './addfilebutton';
import Button from '@material-tailwind/react/components/Button';
import { db, storage } from '@/app/firebase'; 
import { ref, uploadBytesResumable, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import { signOut, useSession} from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import Alert from '@material-tailwind/react/components/Alert';

interface FileData {
  name: string;
  url: string;
}


export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); 
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [userFiles, setUserFiles] = useState<FileData[]>([]);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (status === 'loading') return; 

    if (!session) {
      router.push('/signin'); 
    }
  }, [session, status, router]);



  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const selectedFile = event.target.files && event.target.files[0];

    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Unsupported file type. Please select a PDF, DOC, or DOCX file.');
      } else {
        setFile(selectedFile);
      }
  }
  };

  const handleUpload = async () => {
    if (!file || !session?.user?.email) return;
    const email = session.user.email;
    const storageRef = ref(storage, `files/${email}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    setUploading(true);
  
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error('Error uploading file:', error);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedUrl(downloadURL);
          setUploading(false);
  
          // Write data to Firestore
          await addDoc(collection(db, `files/${email}/metadata`), {
            name: file.name,
            url: downloadURL,
            timestamp: serverTimestamp() // Optionally, add a timestamp
          });
  
          console.log('File upload successful and metadata added to Firestore');
        } catch (error) {
          console.error('Error adding metadata to Firestore:', error);
          setUploading(false);
        }
      }
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex  flex-col justify-center lg:px-8 mx-auto max-w-screen-xl px-6 py-3">
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-black text-center">
          Content
        </h2>
        {error && (
        <Alert className='mt-2 mb-2 w-full sm:w-auto text-sm' variant='outlined' color='red'>
          {error}
        </Alert>
      )}
          <Button placeholder={undefined} className='flex justify-center mt-5 bg-green-900'>
        <input type="file" onChange={handleFileChange} />
      </Button>
      <Button placeholder={undefined} className='flex justify-center mt-2 bg-green-900 ' onClick={handleUpload} disabled={!file || uploading}>
        Upload File
      </Button>
      {uploading && <p className='text-blue-gray-900 text-center'>Uploading... {progress.toFixed(2)}%</p>}
      </div>
      <FileUploader/>
    </div>
  );
}
