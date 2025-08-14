"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import Image from 'next/image';

import useScroll from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';

const Header = () =>
{
    const pathname = usePathname();
    const scrolled : boolean = useScroll(5);
    const selectedLayout = useSelectedLayoutSegment();

    const [ pageTitle, setPageTitle ] = useState<string>("");

    useEffect(() => { setPageTitle(pathname!.slice(1).replace("/", ": ").split("-").join(" ").toLocaleUpperCase()) }, [pathname]);

    return (
        <div
            className={cn(
            `sticky inset-x-0 top-0 z-30 w-full transition-all border-b-2 border-indigo-400 bg-indigo-800`,
            {
                'border-b-2 border-indigo-400 bg-indigo-800/75 backdrop-blur-lg': scrolled,
                'border-b-2 border-indigo-400 bg-indigo-800': selectedLayout,
            }
            )}>
            
            <div className="flex h-[50px] w-full items-center justify-between px-4">
            
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex flex-row space-x-3 items-center justify-center md:hidden">
                        <Image alt="Icon" src={"/icon.png"} width={24} height={24} aria-hidden />
                        <span className="font-bold text-xl flex text-white">LearningAI</span>
                    </Link>
                </div>

                <p className="text-white font-bold text-xl">{pageTitle}</p>

                <div className="hidden md:block">
                    <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-center">
                        <span className="font-semibold text-sm text-indigo-900">AN</span>
                    </div>
                </div>

            </div>
            
        </div>
    );
};

export default Header;