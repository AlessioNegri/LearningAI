import Card from '@/components/card';

const Home = () =>
{
  return (
	<div>

		<header className='text-center'>

			<h1 className='text-5xl text-green-300 font-mono my-8'>Machine Learning</h1>

		</header>

		<div className='w-full h-full grid grid-cols-3 space-x-8 space-y-8'>

			<Card
				page='/machine-learning/regression'
				title='Regression'
				description='A supervised learning technique used to predict a continuous outcome variable based on one or more input features' />

			<Card
				page='/machine-learning/classification'
				title='Classification'
				description='A supervised learning technique used to categorize data into predefined classes or categories' />

			<Card
				page='/machine-learning/clustering'
				title='Clustering'
				description='An unsupervised learning technique that groups similar data points together into clusters based on inherent patterns and similarities within the data' />

			<Card
				page='/machine-learning/association-rule-learning'
				title='Association Rule Learning'
				description='A method for finding "if-then" relationships, also called association rules, in large datasets, often used in market basket analysis to discover products frequently bought together' />

			<Card
				page='/machine-learning/reinforcement-learning'
				title='Reinforcement Learning'
				description='A machine learning technique where an "agent" learns to make decisions through trial and error by interacting with an "environment" to achieve a specific goal' />

			<Card
				page='/machine-learning/natural-language-processing'
				title='Natural Language Processing'
				description='A subfield of AI that applies machine learning techniques to enable computers to understand, interpret, and generate human language' />

			<p></p>

		</div>

		<header className='text-center'>

			<h1 className='text-5xl text-green-300 font-mono my-8'>Deep Learning</h1>

		</header>

		<div className='w-full h-full grid grid-cols-3 space-x-8 space-y-8'>

			<Card
				page='/deep-learning/artificial-neural-network'
				title='Artificial Neural Network'
				description='A deep learning Artificial Neural Network (ANN) is a computational model, inspired by the human brain, that consists of interconnected "neurons" or nodes organized into layers, including an input layer, one or more hidden layers, and an output layer' />

			<p></p>

		</div>

      	<footer></footer>

    </div>
  );
};

export default Home;