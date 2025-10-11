'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import { SIDENAV_ITEMS } from '@/constants';
import { SideNavItem } from '@/types';
import { Icon } from '@iconify/react';

// --- UTILITY 

const MenuItem = ({ item }: { item: SideNavItem }) =>
{
	const pathname = usePathname();

	const [subMenuOpen, setSubMenuOpen] = useState(false);

	const toggleSubMenu = () => { setSubMenuOpen(!subMenuOpen) };

	return (
		<div className=''>
			{
			item.submenu ?
			(
			<>
			<button onClick={toggleSubMenu}
					className={`flex flex-row items-center p-2 mt-2 w-full justify-between border-t-4 border-dashed border-green-300 hover:rounded-lg hover:bg-green-800 ${ pathname.includes(item.path) ? "bg-green-900" : "" }`}>

				<div className='flex flex-row space-x-4 items-center'>

					{item.icon}

					<span className='font-mono text-base text-white'>{item.title}</span>

				</div>

				<div className={`${subMenuOpen ? 'rotate-180' : ''}`}>

					<Icon icon='lucide:chevron-down' width={24} height={24} color="#00FF00" />

				</div>

			</button>

			{subMenuOpen && (
			<div className='my-2 ml-2 flex flex-col space-y-4'>
				{
				item.subMenuItems?.map((subItem, idx) => {
					return (
						<Link key={idx} href={subItem.path} className={`flex flex-row space-x-4 items-center p-2 hover:border-l-4 hover:border-green-300 ${subItem.path === pathname ? 'font-bold border-l-4 border-green-300' : 'hover:border-sky-300'}`}>

							{subItem.icon}

							<span className={`font-mono text-base ${subItem.path === pathname ? 'text-green-300' : 'text-white'}`}>{subItem.title}</span>

						</Link>
					);
				})
				}
			</div>
			)}
			</>)
			:
			(
			<Link href={item.path} className={`flex flex-row space-x-4 items-center p-2 rounded-lg hover:bg-green-800 ${item.path === pathname ? 'bg-green-900' : ''}`}>
				
				{item.icon}

				<span className={`font-mono text-xl flex ${item.path === pathname ? 'text-green-300' : 'text-white'}`}>{item.title}</span>

			</Link>
			)}
		</div>
	);
};

// --- TSX 

const SideNav = () =>
{
	const pathname = usePathname();

	const [datasetIcon, setDatasetIcon] = useState('');

	useEffect(() =>
	{
		const page : String = pathname!.split('/')[2];

		if 		(page === 'regression') 					setDatasetIcon('carbon:emissions-management');
		else if (page === 'classification') 				setDatasetIcon('game-icons:sinking-ship');
		else if (page === 'clustering') 					setDatasetIcon('game-icons:penguin');
		else if (page === 'association-rule-learning') 		setDatasetIcon('fluent-emoji-high-contrast:shopping-cart');
		else if (page === 'reinforcement-learning') 		setDatasetIcon('circum:shop');
		else if (page === 'natural-language-processing')	setDatasetIcon('ri:speak-ai-line');
		else if (page === 'artificial-neural-network')		setDatasetIcon('fontisto:apple-music');
		else if (page === 'convolutional-neural-network')	setDatasetIcon('fluent:animal-paw-print-24-filled');
		else if (page === 'recurrent-neural-network')		setDatasetIcon('streamline-sharp:stock-remix');
		else if (page === 'self-organizing-map')			setDatasetIcon('f7:creditcard-fill');
		else if (page === 'restricted-boltzmann-machine')	setDatasetIcon('mdi:film-open-outline');
		else if (page === 'stacked-autoencoder')			setDatasetIcon('mdi:film-open-outline');
		else 												setDatasetIcon('');
	}, [pathname]);

	return (
		<div className='md:w-80 bg-sky-950 h-screen flex-1 fixed border-r-2 border-green-400 hidden md:flex'>
			
			<div className='flex flex-col space-y-6 w-full bg-repeat heropattern-circuitboard-red-100 pb-4'>
			
				<Link href='/' className='flex flex-row space-x-3 items-center justify-center md:justify-start md:px-6 border-b-2 border-green-400 h-[72px] w-full'>

					{/*<Image alt='Icon' src={'/icon.png'} width={24} height={24} aria-hidden />*/}
					<Icon icon='fa7-solid:robot' width={32} height={32} color='#7bf1a8' />,
					
					<span className='font-bold font-mono text-3xl hidden md:flex text-green-300'>LearningAI</span>

				</Link>

				<div className='flex flex-col space-y-2 md:px-6'>
					
					{ SIDENAV_ITEMS.map((item : SideNavItem, idx : number) => { return <MenuItem key={idx} item={item} /> }) }

				</div>

				<Icon icon={datasetIcon} width={100} height={100} color='#7bf1a8' className='mt-auto w-full' />

			</div>

		</div>
	);
};

export default SideNav;