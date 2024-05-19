from flask import Flask, render_template, request
import openai
from env import apiKey

app = Flask(__name__)

# Initialize global variables
chatStr = ""
openai.api_key = apiKey
isFirstQuery = True

# Function to generate AI response
def chat(data):
    global chatStr, isFirstQuery
    if isFirstQuery:
        recipe = data.get('recipe', 'any dish')
        ingredients = data.get('ingredients', 'any ingredients')
        restrictions = data.get('restrictions', 'no restrictions')
        servings = data.get('servings', 'any number of servings')
        precautions = data.get('precautions', 'no precautions')

        chatStr += (f"User: I want to make {recipe} with ingredients {ingredients}, "
                    f"dietary restrictions {restrictions}, servings {servings}, "
                    f"and I want {precautions} data.\nAssistant: ")
        
        isFirstQuery = False
    else:
        query = data.get('query', '')
        chatStr += f"User: {query}\nAssistant: "
    
    response = openai.Completion.create(
        engine="gpt-3.5-turbo-instruct",
        prompt=chatStr,
        max_tokens=200
    )
    text = response["choices"][0]["text"]
    chatStr += f"{text}\n"
    return text

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/form')
def form():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def process_chat():
    data = request.get_json()
    query = data.get('query', '').lower()
    if "stop listening" in query:
        response = "cooking session ended"
    else:
        response = chat(data)
    return response

if __name__ == '__main__':
    app.run(debug=True)
