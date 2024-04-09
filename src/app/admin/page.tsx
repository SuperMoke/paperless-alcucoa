"use client";
import React, { useState, useEffect } from "react";
import Navbar from "./navbar";
import FileUploader from "./addfilebutton";
import Button from "@material-tailwind/react/components/Button";
import { db, storage } from "@/app/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
} from "firebase/firestore";
import Alert from "@material-tailwind/react/components/Alert";
import { Progress } from "@material-tailwind/react";
import { Input } from "@material-tailwind/react/components/Input";
import FolderUploader from "./addfolderbutton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-regular-svg-icons";
import Select from "@material-tailwind/react/components/Select";
import { Option } from "@material-tailwind/react/components/Select";

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
  const [userFiles, setUserFiles] = useState<FileData[]>([]);
  const [error, setError] = useState("");
  const [folderName, setFolderName] = useState<string>("");
  const [currentFolder, setCurrentFolder] = useState<string>("Root");
  const [showFolderUploader, setShowFolderUploader] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FileData[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("Diploma");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/signin");
    }
  }, [session, status, router]);

  const formatFileName = (fileName: string) => {
    const MAX_LENGTH = 20;

    if (fileName.length > MAX_LENGTH) {
      return fileName.slice(0, MAX_LENGTH - 3) + "...";
    }

    return fileName;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    const selectedFile = event.target.files && event.target.files[0];

    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        setError(
          "Unsupported file type. Please select a PDF, DOC, or DOCX file."
        );
      } else {
        setFile(selectedFile);
        setError("");
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
      setError("");
    }

    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progress.toFixed(0);
        setProgress(progress);
      },
      (error) => {
        setError(`There is an error uploading the file`);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploading(false);

          await addDoc(collection(db, `files/${email}/metadata`), {
            name: file.name,
            url: downloadURL,
            timestamp: serverTimestamp(),
          });
          console.log("File upload successful and metadata added to Firestore");
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

      setFolderName("");
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const hideFolderUploader = () => {
    setShowFolderUploader(false);
  };

  const folderNames = [
    "Diploma",
    "Official Transcript of Records(TOR)",
    "Certificate of attendance to trainings or seminars",
    "Certificate of Employment of the employee from the previous employer",
    "National Certifications or Licenses and board rating",
    "Rating Form for Academic Qualification",
    "Copy of the research output or abstract",
    "Appointment papers of hired employees",
    "Certificate of participation in community involvement",
  ];

  const handleSelectChange = (value: string | undefined) => {
    if (value) {
      setSelectedFolder(value);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, `users/folders/${selectedFolder}/files/metadata`)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const files: FileData[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            files.push({ name: data.name, url: data.url });
          });
          setSearchResults(files);
        });
        return () => unsubscribe();
      } catch (error) {
        setError("Error fetching data");
      }
    };

    fetchData();
  }, [selectedFolder]);

  const filteredFiles = searchResults.filter(
    (file) =>
      searchQuery.trim() !== "" &&
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen">
      {uploading && (
        <Progress value={progress} color="green" placeholder={undefined} />
      )}
      <div className="mt-2"></div>
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
                onClose={() => setError("")}
                animate={{
                  mount: { y: 0 },
                  unmount: { y: 200 },
                }}
                className="mt-2 mb-2 sm:w-auto text-sm"
                variant="outlined"
                color="red"
              >
                {error}
              </Alert>
            </>
          )}
        </div>
        <div className="flex flex-col">
          <div className="relative flex w-full max-w-[24rem]">
            <Input
              type="file"
              size="md"
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
          <div className="mt-5 flex flex-row w-full max-w-[24rem]"></div>

          <Select
            value={selectedFolder}
            onChange={handleSelectChange}
            placeholder={undefined}
            label="Select a folder"
          >
            {folderNames.map((name) => (
              <Option key={name} value={name}>
                {name}
              </Option>
            ))}
          </Select>

          <div className="mt-3"></div>

          <Input
            type="text"
            size="lg"
            color="green"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            label="Search by file name"
            className="pr-20 pt-2 "
            containerProps={{
              className: "min-w-0",
            }}
            crossOrigin={undefined}
          />
        </div>
      </div>
      {filteredFiles.length > 0 && (
        <div>
          <h2 className="text-blue-gray-900 text-center mt-2 mb-5">
            Search Results:
          </h2>
          <ul className="text-blue-gray-900">
            {filteredFiles.map((file, index) => (
              <li key={index} className="mr-3 mb-3 flex flex-col items-center">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faFile} size="3x" />
                </a>
                <span className={"mt-1 text-center"} title={file.name}>
                  {file.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <FileUploader currentFolder={currentFolder} />
      {showFolderUploader && (
        <FolderUploader
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          setfolderName={folderName}
          hideFolderUploader={hideFolderUploader}
        />
      )}
    </div>
  );
}
