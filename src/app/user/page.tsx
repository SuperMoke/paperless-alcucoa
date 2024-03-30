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
import { Progress, Typography } from '@material-tailwind/react';
import Card  from '@material-tailwind/react/components/Card';
import CardHeader from '@material-tailwind/react/components/Card/CardHeader';
import CardBody from '@material-tailwind/react/components/Card/CardBody';
import CardFooter from '@material-tailwind/react/components/Card/CardFooter';
import Input from '@material-tailwind/react/components/Input';

interface FileData {
  name: string;
  url: string;
}


export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  const [file4, setFile4] = useState<File | null>(null);
  const [file5, setFile5] = useState<File | null>(null);
  const [file6, setFile6] = useState<File | null>(null);
  const [file7, setFile7] = useState<File | null>(null);
  const [file8, setFile8] = useState<File | null>(null);
  const [file9, setFile9] = useState<File | null>(null);

  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); 
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [userFiles, setUserFiles] = useState<FileData[]>([]);
  const [error, setError] = useState('');
  const [folderName, setFolderName] = useState<string>('');


  React.useEffect(() => {
    if (status === 'loading') return; 

    if (!session) {
      router.push('/signin'); 
    }
  }, [session, status, router]);

  const setFolderNameBasedOnFiles = () => {
    if (file) {
      setFolderName("Diploma");
      return;
    }
    if (file2) {
      setFolderName("Official Transcript of Records(TOR)");
      return;
    }
    if (file3) {
      setFolderName("Certificate of attendance to trainings/seminars");
      return;
    }
    if (file4) {
      setFolderName("Certificate of Employment of the employee from the previous employer");
      return;
    }
    if (file5) {
      setFolderName("National Certifications/Licenses and board rating");
      return;
    }
    if (file6) {
      setFolderName("Rating Form for Academic Qualification");
      return;
    }
    if (file7) {
      setFolderName("Copy of the research output or abstract");
      return;
    }
    if (file8) {
      setFolderName("Appointment papers of hired employees");
      return;
    }
    if (file9) {
      setFolderName("Certificate of participation in community involvement");
      return;
    }
  };

  useEffect(() => {
    setFolderNameBasedOnFiles();
  }, [file, file2, file3, file4, file5, file6, file7, file8, file9]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>,  setter: Function) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const selectedFile = event.target.files && event.target.files[0];

    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Unsupported file type. Please select a PDF, DOC, or DOCX file.');
      } else {
        setter(selectedFile);
        setError('');
      }
  }
  };

  const handleUpload = async (file: File | null) => {
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
          await addDoc(collection(db, `users/folders/${folderName}/files/metadata`), {
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

  return (
    <div className="flex flex-col h-screen">
      <div className='relative'>
      {uploading && (
      <Progress
        style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        value={progress}
        color="green"
        placeholder={undefined}
      />
    )}
      <div className="mt-3"></div>
      <Navbar />
      </div>
      <div className="flex flex-col justify-center lg:px-8 mx-auto max-w-screen-xl px-6 py-3">
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-black text-center">
          Profile
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

        {uploading && <p className='text-blue-gray-900 text-center'>Uploading... {progress.toFixed(0)}%</p>}
        <div className="mt-10 flex flex-row  justify-center">

    <Card className='w-100' placeholder={undefined}>
  <CardHeader placeholder={undefined} floated={false} shadow={false}>
    <h2 className='text-black text-center'>Requirements</h2>
  </CardHeader>
  <CardBody placeholder={undefined}>
    <div className='flex flex-col'>
        <h2 className='text-black mr-2 mb-2'>Diploma:</h2>
        <div className='relative flex w-full max-w-96 items-center'>
        <Input
          type="file"
          size='md'
          onChange={(e) => handleFileChange(e,setFile)}
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
          color={file ? "green" : "gray"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={() => handleUpload(file)}
        >
          Submit
        </Button>
        </div>

        <h2 className='text-black mr-2 mt-2 mb-2'>Official Transcript of Record(TOR):</h2>
        <div className='relative flex w-full max-w-96 items-center'>
        <Input
          type="file"
          size='md'
          onChange={(e) => handleFileChange(e,setFile2)}
          className="pr-20 pt-2"
          containerProps={{
            className: "min-w-0",
          }}
          placeholder={undefined}
          crossOrigin={undefined}
        />
        <Button
          size="sm"
          disabled={!file2 || uploading}
          color={file2 ? "green" : "gray"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={() => handleUpload(file2)}
        >
          Submit
        </Button>
        </div>

        <h2 className='text-black mr-2 mt-2 mb-2'>Certificate of attendance to trainings/seminars(aligned to the fields of specialization):</h2>
        <div className='relative flex w-full max-w-96 items-center'>
        <Input
          type="file"
          size='md'
          onChange={(e) => handleFileChange(e,setFile3)}
          className="pr-20 pt-2"
          containerProps={{
            className: "min-w-0",
          }}
          placeholder={undefined}
          crossOrigin={undefined}
        />
        <Button
          size="sm"
          disabled={!file3 || uploading}
          color={file3 ? "green" : "gray"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={() => handleUpload(file3)}
        >
          Submit
        </Button>
        </div>

        <h2 className='text-black mr-2 mt-2 mb-2'>Certificate of Employment of the employee from the previous employer:</h2>
        <div className='relative flex w-full max-w-96 items-center'>
        <Input
          type="file"
          size='md'
          onChange={(e) => handleFileChange(e,setFile4)}
          className="pr-20 pt-2"
          containerProps={{
            className: "min-w-0",
          }}
          placeholder={undefined}
          crossOrigin={undefined}
        />
        <Button
          size="sm"
          disabled={!file4 || uploading}
          color={file4 ? "green" : "gray"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={() => handleUpload(file4)}
        >
          Submit
        </Button>
        </div>

        <h2 className='text-black mr-2 mt-2 mb-2'>National Certifications/Licenses and board rating:</h2>
        <div className='relative flex w-full max-w-96 items-center'>
        <Input
          type="file"
          size='md'
          onChange={(e) => handleFileChange(e,setFile5)}
          className="pr-20 pt-2"
          containerProps={{
            className: "min-w-0",
          }}
          placeholder={undefined}
          crossOrigin={undefined}
        />
        <Button
          size="sm"
          disabled={!file5 || uploading}
          color={file5 ? "green" : "gray"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={() => handleUpload(file5)}
        >
          Submit
        </Button>
        </div>

        <h2 className='text-black mr-2 mt-2 mb-2'>Rating Form for Academic Qualification:</h2>
        <div className='relative flex w-full max-w-96 items-center'>
        <Input
          type="file"
          size='md'
          onChange={(e) => handleFileChange(e,setFile6)}
          className="pr-20 pt-2"
          containerProps={{
            className: "min-w-0",
          }}
          placeholder={undefined}
          crossOrigin={undefined}
        />
        <Button
          size="sm"
          disabled={!file6 || uploading}
          color={file6 ? "green" : "gray"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={() => handleUpload(file6)}
        >
          Submit
        </Button>
        </div>

        <h2 className='text-black mr-2 mt-2 mb-2'>Copy of the research output or abstract
:</h2>
        <div className='relative flex w-full max-w-96 items-center'>
        <Input
          type="file"
          size='md'
          onChange={(e) => handleFileChange(e,setFile7)}
          className="pr-20 pt-2"
          containerProps={{
            className: "min-w-0",
          }}
          placeholder={undefined}
          crossOrigin={undefined}
        />
        <Button
          size="sm"
          disabled={!file7 || uploading}
          color={file7 ? "green" : "gray"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={() => handleUpload(file7)}
        >
          Submit
        </Button>
        </div>

        
        <h2 className='text-black mr-2 mt-2 mb-2'>Appointment papers of hired employees:</h2>
        <div className='relative flex w-full max-w-96 items-center'>
        <Input
          type="file"
          size='md'
          onChange={(e) => handleFileChange(e,setFile8)}
          className="pr-20 pt-2"
          containerProps={{
            className: "min-w-0",
          }}
          placeholder={undefined}
          crossOrigin={undefined}
        />
        <Button
          size="sm"
          disabled={!file8 || uploading}
          color={file8 ? "green" : "gray"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={() => handleUpload(file8)}
        >
          Submit
        </Button>
        </div>

        <h2 className='text-black mr-2 mt-2 mb-2'>Certificate of partiipation in community involvement:</h2>
        <div className='relative flex w-full max-w-96 items-center'>
        <Input
          type="file"
          size='md'
          onChange={(e) => handleFileChange(e,setFile9)}
          className="pr-20 pt-2"
          containerProps={{
            className: "min-w-0",
          }}
          placeholder={undefined}
          crossOrigin={undefined}
        />
        <Button
          size="sm"
          disabled={!file9 || uploading}
          color={file9 ? "green" : "gray"}
          className="!absolute right-1 top-1 rounded bg-green-900"
          placeholder={undefined}
          onClick={() => handleUpload(file9)}
        >
          Submit
        </Button>
        </div>
    </div>
  </CardBody>
</Card>
        </div>
      </div>
    </div>
  );
}
