"use client";

import React, { useState } from 'react';
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
		<div className="">
			{
			item.submenu ?
			(
			<>
			<button onClick={toggleSubMenu}
					className={`flex flex-row items-center p-2 rounded-lg hover-bg-indigo-100 w-full justify-between hover:bg-indigo-400 ${ pathname.includes(item.path) ? "bg-indigo-400" : "" }`}>

				<div className="flex flex-row space-x-4 items-center">
					{item.icon}
					<span className="font-semibold text-xl flex text-white">{item.title}</span>
				</div>

				<div className={`${subMenuOpen ? 'rotate-180' : ''} flex`}>
					<Icon icon="lucide:chevron-down" width="24" height="24" color="#FFFFFF" />
				</div>

			</button>

			{subMenuOpen && (
			<div className="my-2 ml-2 flex flex-col space-y-4">
				{
				item.subMenuItems?.map((subItem, idx) => {
					return (
						<Link key={idx} href={subItem.path} className={`flex flex-row space-x-4 items-center pl-2 ${subItem.path === pathname ? "font-bold border-l-4 border-orange-300" : ""}`}>

							{subItem.icon}
							<span className={`${subItem.path === pathname ? "text-orange-300" : "text-white"}`}>{subItem.title}</span>

						</Link>
					);
				})
				}
			</div>
			)}
			</>)
			:
			(
			<Link href={item.path} className={`flex flex-row space-x-4 items-center p-2 rounded-lg hover:bg-indigo-400 ${item.path === pathname ? "bg-indigo-400" : ""}`}>
				
				{item.icon}
				<span className="font-semibold text-xl flex text-white">{item.title}</span>

			</Link>
			)}
		</div>
	);
};

// --- TSX 

const SideNav = () =>
{
	return (
		<div className="md:w-80 bg-indigo-800 h-screen flex-1 fixed border-r-2 border-indigo-400 hidden md:flex">
			
			<div className="flex flex-col space-y-6 w-full bg-repeat heropattern-circuitboard-red-100">
			
				<Link href="/" className="flex flex-row space-x-3 items-center justify-center md:justify-start md:px-6 border-b-2 border-indigo-400 h-[52px] w-full">

					<Image alt="Icon" src={"/icon.png"} width={24} height={24} aria-hidden />
					<span className="font-bold text-xl hidden md:flex text-white">LearningAI</span>

				</Link>

				<div className="flex flex-col space-y-2 md:px-6">
					
					{ SIDENAV_ITEMS.map((item : SideNavItem, idx : number) => { return <MenuItem key={idx} item={item} /> }) }

				</div>

			</div>

		</div>
	);
};

export default SideNav;