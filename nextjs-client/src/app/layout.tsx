import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Header             from "@/components/header";
import HeaderMobile       from "@/components/header-mobile";
import MarginWidthWrapper from "@/components/margin-width-wrapper";
import PageWrapper        from "@/components/page-wrapper";
import SideNav            from "@/components/side-nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata : Metadata =
{
	applicationName: "LearningAI",
	authors: [{ name: "Alessio Negri", url: "https://github.com/AlessioNegri" }],
	title: "LearningAI",
	description: "Web application to compare AI models",
};

export default function RootLayout( { children } : Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<div className="w-full flex">
					<SideNav/>
					<main className="flex-1 w-full">
						<MarginWidthWrapper>
							<Header/>
							<HeaderMobile/>
							<PageWrapper>{children}</PageWrapper>
						</MarginWidthWrapper>
					</main>
				</div>
			</body>
		</html>
  	);
};