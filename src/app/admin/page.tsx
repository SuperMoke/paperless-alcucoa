'use client'
import React,{ useState, useEffect } from 'react';
import Navbar from './navbar';
import FileUploader from './addfilebutton';
import Button from '@material-tailwind/react/components/Button';
import { db, storage } from '@/app/firebase'; 
import { ref, uploadBytesResumable, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import { signOut, useSession} from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, doc, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';
import Alert from '@material-tailwind/react/components/Alert';
import { Progress } from '@material-tailwind/react';
import { Input } from '@material-tailwind/react/components/Input';
import FolderUploader from './addfolderbutton';


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
  const [folderName, setFolderName] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState<string>('Root');
  const [showFolderUploader, setShowFolderUploader] = useState<boolean>(true);

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
        setError('');
      }
  }
  };

  const handleUpload = async () => {
    if (!file || !session?.user?.email) return;
    const email = session.user.email;
    const storageRef = ref(storage, `files/${email}/${file.name}`);

    try {
      await getMetadata(storageRef);
      setError(`File already exists.`);
      return;
    } catch (error) {
      setError('');
    }

    const uploadTask = uploadBytesResumable(storageRef, file);
  
    setUploading(true);
  
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progress.toFixed(0)
        setProgress(progress);
      },
      (error) => {
        setError(`There is an error uploading the file`);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedUrl(downloadURL);
          setUploading(false);
  
          await addDoc(collection(db, `files/${email}/metadata`), {
            name: file.name,
            url: downloadURL,
            timestamp: serverTimestamp()
          });
          console.log('File upload successful and metadata added to Firestore');
        } catch (error) {
          setError(`There is an error uploading the file`);
          setUploading(false);
        }
      }
    );
  };

  const handleFolderCreate = async () => {
    if (!folderName || !session?.user?.email) return;
    try {
      const email = session.user.email;
    const folderRef = collection(db, `users/${email}/folders`);
    
    // Fetch existing folders
    const querySnapshot = await getDocs(folderRef);
    
    // Find the highest ID
    let maxId = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.id > maxId) {
        maxId = data.id;
      }
    });
    const newFolderId = maxId + 1;

    await addDoc(folderRef, {
      id: newFolderId,
      name: folderName,
      createdAt: new Date(),
    });

    setFolderName('');
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const hideFolderUploader = () => {
    setShowFolderUploader(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {uploading && (
          <Progress
            value={progress}
            color="green"
            placeholder={undefined}          
          />
    )}
    <div className='mt-2'></div>
  <Navbar />
  <div className="flex  flex-col justify-center lg:px-8 mx-auto max-w-screen-xl px-6 py-3">
    <h2 className="text-2xl font-bold leading-9 tracking-tight text-black text-center">
      Content
    </h2>
    <div>
      {error && (
        <>
          <Alert 
            open={true} 
            onClose={() => setError('')} 
            animate={{
              mount: { y: 0 },
              unmount: { y: 200 },
            }}
            className='mt-2 mb-2 sm:w-auto text-sm' 
            variant='outlined' 
            color='red'
          >
            {error}
          </Alert>
        </>
      )}
    </div>
    <div className='flex flex-col'>
    <div className='relative flex w-full max-w-[24rem]'>
      <Input
          type="file"
          size='md'
          onChange={handleFileChange}
          className="pr-20 pt-2"
          containerProps={{
            className: "min-w-0",
          }}
          placeholder={undefined}
          crossOrigin={undefined}
        />
        <Button
          size="sm"
          disabled={!file || uploading}
          color={file ? "green" : "green"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={handleUpload}
        >
          Submit
        </Button>
        </div>
        <div className='mt-5 flex flex-row w-full max-w-[24rem]'>
          
        </div>
        <Input
            type="text"
            size='lg'
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Enter folder name"
            className="pr-20 pt-2"
            containerProps={{
              className: "min-w-0",
            }}
            crossOrigin={undefined}
          />
          <Button
            size="sm"
            color="green"
            className="mt-5 rounded bg-green-900"
            onClick={handleFolderCreate}
            placeholder={undefined}
          >
            Create Folder
          </Button>
    </div>
  </div>
  <FileUploader currentFolder={currentFolder} />
  {showFolderUploader && <FolderUploader currentFolder={currentFolder} setCurrentFolder={setCurrentFolder} setfolderName={folderName} hideFolderUploader={hideFolderUploader} />}
</div>
  );
}