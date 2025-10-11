'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import Image from 'next/image';
import { Icon } from '@iconify/react';

import useScroll from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';

const Header = () =>
{
    const pathname = usePathname();

    const scrolled : boolean = useScroll(5);

    const selectedLayout = useSelectedLayoutSegment();

    const [ pageTitle, setPageTitle ] = useState<string>('DASHBOARD');

    const [fieldIcon, setFieldIcon] = useState('');

    const [subFieldIcon, setSubFieldIcon] = useState('');

    useEffect(() =>
    {
        if (pathname !== '/')
        {
            setPageTitle(pathname!.slice(1).replace("/", ": ").split("-").join(" ").toLocaleUpperCase());

            const field : String = pathname!.split('/')[1];

            const subField : String = pathname!.split('/')[2];

            if      (field === 'machine-learning')  setFieldIcon('eos-icons:machine-learning-outlined');
            else if (field === 'deep-learning')     setFieldIcon('eos-icons:neural-network');
            else                                    setFieldIcon('');

            if 		(subField === 'regression') 					setSubFieldIcon('carbon:emissions-management');
            else if (subField === 'classification') 				setSubFieldIcon('game-icons:sinking-ship');
            else if (subField === 'clustering') 					setSubFieldIcon('game-icons:penguin');
            else if (subField === 'association-rule-learning') 		setSubFieldIcon('fluent-emoji-high-contrast:shopping-cart');
            else if (subField === 'reinforcement-learning') 		setSubFieldIcon('circum:shop');
            else if (subField === 'natural-language-processing')	setSubFieldIcon('ri:speak-ai-line');
            else if (subField === 'artificial-neural-network')		setSubFieldIcon('fontisto:apple-music');
            else if (subField === 'convolutional-neural-network')	setSubFieldIcon('fluent:animal-paw-print-24-filled');
            else if (subField === 'recurrent-neural-network')		setSubFieldIcon('streamline-sharp:stock-remix');
            else if (subField === 'self-organizing-map')			setSubFieldIcon('f7:creditcard-fill');
            else if (subField === 'restricted-boltzmann-machine')   setSubFieldIcon('mdi:film-open-outline');
            else if (subField === 'stacked-autoencoder')            setSubFieldIcon('mdi:film-open-outline');
            else 												    setSubFieldIcon('');
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

                <div className='flex space-x-4'>
                    <Icon icon={fieldIcon} width={40} height={40} color='#7bf1a8' className='mt-auto w-full' />

                    <p className="text-green-300 font-mono font-bold text-4xl text-nowrap">{pageTitle}</p>

                    <Icon icon={subFieldIcon} width={40} height={40} color='#7bf1a8' className='mt-auto w-full' />
                </div>

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