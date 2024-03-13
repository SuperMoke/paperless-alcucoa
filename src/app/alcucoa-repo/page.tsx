'use client'
import React,{ useState, useEffect } from 'react';
import Navbar from './navbar';
import FileUploader from './addfilebutton';
import Button from '@material-tailwind/react/components/Button';
import { db, storage } from '@/app/firebase'; 
import { ref, uploadBytesResumable, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import { signOut, useSession} from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';

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

  React.useEffect(() => {
    if (status === 'loading') return; 

    if (!session) {
      router.push('/signin'); 
    }
  }, [session, status, router]);



  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
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
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setUploadedUrl(downloadURL);
          setUploading(false);
        });
      }
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="mx-auto max-w-screen-xl px-6 py-3">
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-black text-center">
          Content
        </h2>
        <Button 
            className='flex w-full justify-center'
            placeholder={undefined} 
            onClick={() => signOut()}            
          >
            Logout
          </Button>
          <Button placeholder={undefined} className='flex w-full justify-center mt-5'>
        <input type="file" onChange={handleFileChange} />
      </Button>
      <Button placeholder={undefined} className='flex justify-center mt-2 w-full flex-shrink-0' onClick={handleUpload} disabled={!file || uploading}>
        Upload File
      </Button>
      {uploading && <p className='text-blue-gray-900'>Uploading... {progress.toFixed(2)}%</p>}
      </div>
      <FileUploader/>
    </div>
  );
}
