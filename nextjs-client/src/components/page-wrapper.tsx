import { ReactNode } from 'react';

export default function PageWrapper({ children }: { children: ReactNode })
{
	return ( <div className="flex flex-col flex-grow p-4 space-y-2 bg-sky-950">{children}</div> );
};