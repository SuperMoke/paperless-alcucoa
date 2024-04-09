"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-regular-svg-icons";

interface FileData {
  name: string;
  url: string;
}

interface FileUploaderProps {
  currentFolder: string; 
}

const formatFileName = (fileName: string) => {
  const MAX_LENGTH = 20;

  if (fileName.length > MAX_LENGTH) {
    return fileName.slice(0, MAX_LENGTH - 3) + "...";
  }

  return fileName;
};

const FileUploader: React.FC<FileUploaderProps> = ({ currentFolder }) => {
  const [userFiles, setUserFiles] = useState<FileData[]>([]);

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const userFilesRef = collection(
          db,
          `users/folders/${currentFolder}/files/metadata`
        );
        const querySnapshot = await getDocs(userFilesRef);
        const filesUrls = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return { name: data.name, url: data.url };
        });
        setUserFiles(filesUrls);
      } catch (error) {
        console.error("Error fetching user files:", error);
      }
    };

    const unsubscribe = onSnapshot(
      collection(db, `users/folders/${currentFolder}/files/metadata`),
      () => {
        fetchUserFiles();
      }
    );

    fetchUserFiles(); // Fetch data initially

    return () => unsubscribe();
  }, [currentFolder]);

  return (
    <div>
      <div className="mx-auto max-w-screen-xl px-6 py-3">
        {userFiles.length > 0 && (
          <div className="flex  flex-col justify-center lg:px-8 mx-auto max-w-screen-xl px-6 py-3">
            <h3 className="text-blue-gray-900 mb-5 text-center text">
              Uploaded Files:
            </h3>
            <ul className="text-blue-gray-900 flex flex-row flex-wrap">
              {userFiles.map((file) => (
                <li
                  key={file.name}
                  className="mr-3 mb-3 flex flex-col items-center"
                >
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faFile} size="3x" />
                  </a>
                  <span className={"mt-1 text-center"} title={file.name}>
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
