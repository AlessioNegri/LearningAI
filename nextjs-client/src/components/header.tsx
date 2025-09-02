'use client';

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

    const [ pageTitle, setPageTitle ] = useState<string>('DASHBOARD');

    useEffect(() =>
    {
        if (pathname !== '/')
        {
            setPageTitle(pathname!.slice(1).replace("/", ": ").split("-").join(" ").toLocaleUpperCase());
        }
        else
        {
            setPageTitle('DASHBOARD');
        }
    }, [pathname]);

    return (
        <div
            className={cn(
            `sticky inset-x-0 top-0 z-30 w-full transition-all border-b-2 bg-sky-950 border-green-400`,
            {
                'border-b-2 border-green-400 bg-sky-950/75 backdrop-blur-lg': scrolled,
                'border-b-2 border-green-400 bg-sky-950': selectedLayout,
            }
            )}>
            
            <div className="flex h-[70px] w-full items-center justify-between px-4">
            
                <div className="flex items-center space-x-4">

                    <Link href="/" className="flex flex-row space-x-3 items-center justify-center md:hidden">

                        <Image alt="Icon" src={"/icon.png"} width={24} height={24} aria-hidden />

                        <span className="font-bold text-xl flex text-white">LearningAI</span>
                        
                    </Link>

                </div>

                <p className="text-green-300 font-mono font-bold text-4xl">{pageTitle}</p>

                <div className="hidden md:block">

                    <div className="h-12 w-12 rounded-full bg-green-300 flex items-center justify-center text-center">

                        <span className="font-mono font-bold text-2xl text-sky-800">AN</span>

                    </div>
                    
                </div>

            </div>
            
        </div>
    );
};

export default Header;