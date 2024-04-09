"use client";
import { useState, useEffect } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  getMetadata,
} from "firebase/storage";
import { db, storage } from "@/app/firebase";
import { Button } from "@material-tailwind/react/components/Button";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-regular-svg-icons";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

interface FileData {
  name: string;
  url: string;
}

const formatFileName = (fileName: string) => {
  const MAX_LENGTH = 20;

  if (fileName.length > MAX_LENGTH) {
    return fileName.slice(0, MAX_LENGTH - 3) + "...";
  }

  return fileName;
};

const FileUploader = () => {
  const [userFiles, setUserFiles] = useState<FileData[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUserFiles = async () => {
      if (!session?.user?.email) return;
      const email = session.user.email;
      const userFilesRef = collection(
        db,
        `user/admin@cca.edu.ph/folders/metad`
      );

      const querySnapshot = await getDocs(userFilesRef);

      const filesUrls = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return { name: data.name, url: data.url };
      });
      setUserFiles(filesUrls);
    };

    fetchUserFiles();

    const unsubscribe = onSnapshot(
      collection(db, `files/${session?.user?.email}/metadata`),
      () => {
        fetchUserFiles();
      }
    );

    return () => unsubscribe();
  }, [session]);

  return (
    <div>
      <div className="mx-auto max-w-screen-xl px-6 py-3">
        {userFiles.length > 0 && (
          <div className="flex flex-col justify-center lg:px-8 mx-auto max-w-screen-xl px-6 py-3">
            <ul className="text-blue-gray-900 flex flex-row flex-wrap justify-center">
              {" "}
              {/* Add justify-center class */}
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
