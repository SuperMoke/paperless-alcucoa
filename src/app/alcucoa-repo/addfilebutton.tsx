'use client'
import { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import { storage } from '@/app/firebase'; 
import { Button } from '@material-tailwind/react/components/Button';
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';

interface FileData {
  name: string;
  url: string;
}
const formatFileName = (fileName: string) => {
  const words = fileName.split(' ');
  if (words.length > 2) {
    const truncatedName = words.slice(0, 2).join(' ');
    const remainingWords = words.slice(2).join(' ');
    return (
      <>
        <span>{truncatedName}</span>
        <br />
        <span>{remainingWords}</span>
      </>
    );
  }
  return fileName;
};


const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); 
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [userFiles, setUserFiles] = useState<FileData[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUserFiles = async () => {
      if (!session?.user?.email) return;
      const email = session.user.email;
      const userFilesRef = ref(storage, `files/${email}/`);
      const filesList = await listAll(userFilesRef);
      const filesUrls = await Promise.all(
        filesList.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          return { name: metadata.name, url: await getDownloadURL(itemRef) };
        })
      );
      setUserFiles(filesUrls);
    };

    fetchUserFiles();
  }, [session]);
  


  return (
    <div>
      <div className='mx-auto max-w-screen-xl px-6 py-3'>
        {userFiles.length > 0 && (
          <div>
            <h3 className='text-blue-gray-900 m-2'>Uploaded Files:</h3>
            <ul className='text-blue-gray-900 flex flex-row flex-wrap'>
              {userFiles.map((file) => (
                <li key={file.name} className='mr-3 mb-3 flex flex-col items-center'>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faFile} size="3x" />
                  </a>
                  <span className="mt-1 text-center overflow-hidden whitespace-normal break-words">
                    {formatFileName(file.name)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
