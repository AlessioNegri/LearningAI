'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';

interface CardProps
{
    title: string
    description: string
    page: string
}

export default function Card(props : CardProps) : any
{
    return (
        <Link
        href={props.page}
        className="flex-1 flex flex-col justify-between rounded-xl overflow-hidden shadow-lg shadow-green-300 bg-sky-900 hover:shadow-sky-300 text-green-300 hover:text-sky-300 cursor-pointer hover:scale-95">

            <div className="px-6 py-4">

                <div className="font-bold text-3xl mb-4 font-mono">{props.title}</div>

                <p className="text-white text-2xl text-justify font-mono">{props.description}</p>
            </div>

            <div className="px-6 pt-4 pb-2 flex items-stretch justify-end">
                <Icon icon='solar:arrow-right-bold' width={32} height={32} color='#7bf1a8' className='w-[40px]' />
            </div>

        </Link>
    );
}