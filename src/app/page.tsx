'use client'
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'loading') return; 

    if (!session) {
      router.push('/signin');
    } else {
      router.push('/alcucoa-repo'); 
    }
  }, [session, status]);


  if (status === 'loading') {
    return <div>Loading...</div>;
  } 
}
