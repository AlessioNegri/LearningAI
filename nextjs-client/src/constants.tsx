import { Icon } from '@iconify/react';
import { SideNavItem } from './types';

export const SIDENAV_ITEMS : SideNavItem[] =
[
	{
		title: "Home",
		path: "/",
		icon: <Icon icon="fa7-solid:home-alt" width="32" height="32" color="#FFFFFF" />
	},
	{
		title: "Machine Learning",
		path: "/machine-learning",
		icon: <Icon icon="eos-icons:machine-learning-outlined" width="32" height="32" color="#FFFFFF" />,
		submenu: true,
		subMenuItems:
		[
			{
				title: "Regression",
				path: "/machine-learning/regression",
				icon: <Icon icon="carbon:chart-logistic-regression" width="32" height="32" color="#FFFFFF" />
			},
			{
				title: "Classification",
				path: "/machine-learning/classification",
				icon: <Icon icon="mingcute:classify-2-fill" width="32" height="32" color="#FFFFFF" />
			},
			{
				title: "Clustering",
				path: "/machine-learning/clustering",
				icon: <Icon icon="material-symbols:groups-outline" width="32" height="32" color="#FFFFFF" />
			},
			{
				title: "Association Rule Learning",
				path: "/machine-learning/association-rule-learning",
				icon: <Icon icon="fluent-emoji-high-contrast:link" width="32" height="32" color="#FFFFFF" />
			},
			{
				title: "Reinforcement Learning",
				path: "/machine-learning/reinforcement-learning",
				icon: <Icon icon="game-icons:strong" width="32" height="32" color="#FFFFFF" />
			},
			{
				title: "Natural Language Processing",
				path: "#",
				icon: <Icon icon="streamline:dictionary-language-book-solid" width="32" height="32" color="#FFFFFF" />
			}
		]
	}
];