import { ReactNode } from 'react';

export default function MarginWidthWrapper({ children }: { children: ReactNode })
{
	return (
		<div className="flex flex-col ml-80 min-h-screen sm:border-r sm:border-indigo-900">
			{children}
		</div>
	);
};