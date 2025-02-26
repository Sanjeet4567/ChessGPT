
import Head from "next/head"
import "./global.css"

export const metadata={
    title: "ChessGPT",
    description : "The place to go for all your Chess questions!",
    icon:{
        href:"/logo.png"
    }
    
    
}

const RootLayout=({children}:{children:React.ReactNode})=>{
    return (
        <html lang="en">
            <head>
                <title>ChessGPT</title>
                <link rel="icon" href="/logo.png" />
            </head>
            <body>{children}</body>
        </html>
    )
}
export default RootLayout