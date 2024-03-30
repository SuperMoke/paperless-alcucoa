'use client'
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userEmail  = session?.user?.email;

  React.useEffect(() => {
    if (status === 'loading') return; 

    if (!session) {
      router.push('/signin');
    } else {
      if(userEmail){
        if(userEmail.includes("user")){
          router.push('/user');
        } else {
          router.push('/admin');
        }
      } 
    }
  }, [session, status]);


  if (status === 'loading') {
    return <div>Loading...</div>;
  } 
}
