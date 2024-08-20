import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Head from "next/head"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "txt-2-bpmn",
	description: "Generated by create next app",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<Head>
				<link
					rel='stylesheet'
					href='/node_modules/bpmn-js/dist/assets/diagram-js.css'
				/>
				<link
					rel='stylesheet'
					href='/node_modules/bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
				/>
			</Head>
			<body className={inter.className}>{children}</body>
		</html>
	)
}
