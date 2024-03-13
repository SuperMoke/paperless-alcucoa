'use client'
import { Card, CardHeader} from "@material-tailwind/react/components/Card"
import { CardFooter } from "@material-tailwind/react/components/Card/CardFooter"
import { CardBody } from "@material-tailwind/react/components/Card/CardBody"
import { Input } from "@material-tailwind/react/components/Input"
import { Button } from "@material-tailwind/react/components/Button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Alert from "@material-tailwind/react/components/Alert"



export default function Signin(){
    const [email, setEmai] = useState('')
    const [password,setPassword] = useState('')
    const [error, setError] = useState('');
    const router = useRouter();

    const handSignIn = async () => {
        const result = await signIn('credentials',{
            email,
            password,
            redirect: false,
            callbackUrl: '/alcucoa-repo',
        });
        if(result?.error){
            setError('Sorry, Wrong Email or Password!')
        }else {
            router.push('/')
        }

    }
    return(
        <>
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <Card placeholder={undefined} className="mt-5  sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img className=" mt-5 h-34 w-24 mx-auto" src="cca-logo.png"></img>
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black">
                     Paperless ALCUCOA Accreditation System
                     </h2>
                </div>
                <CardBody placeholder={undefined} className="flex flex-col gap-4">
                {error && (
        <Alert className='mt-2 mb-2 w-full sm:w-auto text-sm' variant='outlined' color='red'>
          {error}
        </Alert>
      )}
                    <Input color='green' label="Email"crossOrigin={undefined}required size="lg"
                    onChange={(e) => setEmai(e.target.value)}/>
                    <Input color='green' label="Password" type='password'crossOrigin={undefined}required size="lg"
                    onChange={(e) => setPassword(e.target.value)}/>
                </CardBody>
                <CardFooter placeholder={undefined}>
                    <Button placeholder={undefined} className="flex w-full justify-center bg-green-900"
                    onClick={handSignIn}> Sign In</Button>
                </CardFooter>
            </Card>
        </div>
        </>
    )
}