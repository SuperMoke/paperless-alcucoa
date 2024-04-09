import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/app/firebase";
import { Button } from "@material-tailwind/react/components/Button";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder } from "@fortawesome/free-solid-svg-icons/faFolder";
import { useRouter } from "next/navigation";

interface FolderData {
  id: any;
  name: any;
}

interface FolderUploaderProps {
  currentFolder: string;
  setCurrentFolder: React.Dispatch<React.SetStateAction<string>>;
  setfolderName: string;
  hideFolderUploader: () => void; // New prop to hide the FolderUploader
}

const FolderUploader: React.FC<FolderUploaderProps> = ({
  currentFolder,
  setCurrentFolder,
  setfolderName,
  hideFolderUploader,
}) => {
  const [userFolders, setUserFolders] = useState<FolderData[]>([]);
  const { data: session } = useSession();
  const router = useRouter();

  const handleFolderClick = (folderName: string) => {
    setCurrentFolder(folderName);
    hideFolderUploader();
  };

  useEffect(() => {
    const fetchUserFolders = async () => {
      if (!session?.user?.email) return;
      const email = session.user.email;
      const userFoldersRef = collection(db, `users/${email}/folders`);
      const querySnapshot = await getDocs(
        query(userFoldersRef, orderBy("name", "asc"))
      );
      const fetchedFolders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      console.log(fetchedFolders);
      setUserFolders(fetchedFolders);
    };

    fetchUserFolders();

    if (!session?.user?.email) return;
    const email = session.user.email;

    const userFoldersRef = collection(db, `users/${email}/folders`);
    const unsubscribe = onSnapshot(userFoldersRef, fetchUserFolders);

    return () => unsubscribe();
  }, [session]);

  return (
    <div>
      <div className="mx-auto max-w-screen-xl px-6 py-3">
        {userFolders.length > 0 && (
          <div className="flex  flex-col justify-center lg:px-8 mx-auto max-w-screen-xl px-6 py-3">
            <h3 className="text-blue-gray-900 mb-5 text-center text">
              User Folders: {currentFolder}
            </h3>
            <ul className="text-blue-gray-900 flex flex-col flex-wrap">
              {userFolders.map((folder) => (
                <li
                  key={folder.id}
                  className="mr-3 mb-3 flex flex-row items-center"
                >
                  <Button
                    color="blue"
                    size="sm"
                    onClick={() => handleFolderClick(folder.name)}
                    placeholder={undefined}
                  >
                    <FontAwesomeIcon icon={faFolder} size="3x" />
                  </Button>
                  <span className="mt-1 ml-2 text-center" title={folder.name}>
                    {folder.name}
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

export default FolderUploader;
