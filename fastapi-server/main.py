import fastapi as fa

from fastapi.middleware.cors import CORSMiddleware

from routers.machine_learning.regression import router as router_ml_regression
from routers.machine_learning.classification import router as router_ml_classification
from routers.machine_learning.clustering import router as router_ml_clustering
from routers.machine_learning.associaton_rule_learning import router as router_ml_associaton_rule_learning
from routers.machine_learning.reinforcement_learning import router as router_ml_reinforcement_learning
from routers.machine_learning.natural_language_processing import router as router_ml_natural_language_processing

from routers.deep_learning.artificial_neural_network import router as router_dl_artificial_neural_network
from routers.deep_learning.convolutional_neural_network import router as router_dl_convolutional_neural_network
from routers.deep_learning.recurrent_neural_network import router as router_dl_recurrent_neural_network
from routers.deep_learning.self_organizing_map import router as router_dl_self_organizing_map
from routers.deep_learning.restricted_boltzmann_machine import router as router_dl_restricted_boltzmann_machine

# >>> Pylance for type checking (python.analysis.typeCheckingMode settings)
# >>> Launch from CL: fastapi dev fastapi-server/main.py

description = """LearningAI backend server implement all AI algorithms.

## Packages

* **Python** 3.11.9
* **FastAPI** 0.116.1
* **Numpy** 2.3.2
* **Pandas** 2.3.1
* **Termcolor** 3.1.0
* **SciKit-Learn** 1.7.1
* **PyMongo** 4.13.2
* **apyori** 1.1.2
* **nltk** 3.9.1
* **xgboost** 3.0.4
* **tensorflow** 2.20.0
* **aiofiles** 24.1.0
* **minisom** 2.3.5
* **matplotlib** 3.10.6
* **torch** 2.8.0
"""

app = fa.FastAPI(
    title="LearningAI 🤖",
    description=description,
    summary="LearningAI backend server",
    version="1.0.0"
)

app.add_middleware(CORSMiddleware, allow_origins=[ 'http://localhost:3000' ], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(router_ml_regression)
app.include_router(router_ml_classification)
app.include_router(router_ml_clustering)
app.include_router(router_ml_associaton_rule_learning)
app.include_router(router_ml_reinforcement_learning)
app.include_router(router_ml_natural_language_processing)

app.include_router(router_dl_artificial_neural_network)
app.include_router(router_dl_convolutional_neural_network)
app.include_router(router_dl_recurrent_neural_network)
app.include_router(router_dl_self_organizing_map)
app.include_router(router_dl_restricted_boltzmann_machine)