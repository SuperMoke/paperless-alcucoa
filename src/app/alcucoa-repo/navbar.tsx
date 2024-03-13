import { Navbar } from '@material-tailwind/react/components/Navbar'
import { Typography } from '@material-tailwind/react/components/Typography'
import React from 'react'



export default function navbar() {
  return (
    <div>
        <Navbar className="mx-auto max-w-screen-xl py-3" fullWidth = {true} placeholder={undefined}>
            <div className="flex items-center justify-between text-blue-gray-900">
            <Typography
                      as="a"
                      href="#"
                      variant="h6"
                      className="mr-4 mt-2 cursor-pointer py-1.5" placeholder={undefined}            >
            Paperless Alcucoa Accreditation System
            </Typography>
            </div>
        </Navbar>
    </div>
  )
}
