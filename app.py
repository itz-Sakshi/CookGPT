from flask import Flask, render_template, request
import openai
import os

app = Flask(__name__)

# Initialize global variables
openai.api_key = os.environ.get('apiKey')
isFirstQuery = True

# Function to generate AI response
def chat(data):
    global isFirstQuery
    chatStr = ""
    if isFirstQuery:
        recipe = data.get('recipe', 'any dish')
        ingredients = data.get('ingredients', 'any ingredients')
        restrictions = data.get('restrictions', 'no restrictions')
        servings = data.get('servings', 'any number of servings')
        precautions = data.get('precautions', 'no precautions')

        # Check if all fields are at their default values
        if (recipe == 'any dish' and
            ingredients == 'any ingredients' and
            restrictions == 'no restrictions' and
            servings == 'any number of servings' and
            precautions == 'no precautions'):
            chatStr = "I hope you'll be able to provide me with a great recipe to cook a delicious meal today. So, firstly start by asking me what I want to cook today."
        else:
            chatStr = (f"I want to make {recipe} with ingredients {ingredients}, "
                       f"dietary restrictions {restrictions}, servings {servings}, "
                       f"and I want {precautions} precautions data.\n")
        
        isFirstQuery = False
    else:
        query = data.get('query', '')
        if "ai" in query.lower().strip(): 
            chatStr = f"Give me the recipe {query}\n"
        else:
            print("Non-cookgpt query detected. Ignoring.")
            return ""  # Discard non-cookgpt lines
    
    print("Sending request to OpenAI:", chatStr)
    response = openai.Completion.create(
        engine="gpt-3.5-turbo",
        prompt=chatStr,
        max_tokens=100
    )
    text = response["choices"][0]["text"]
    print("Received response from OpenAI:", text)
    return text

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/index')
def form():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def process_chat():
    data = request.get_json()
    print("Received data:", data)  # Debug line
    query = data.get('query', '').lower()
    if "ai stop" in query:
        response = "cooking session ended"
    else:
        response = chat(data)
        if not response:
            response = ""  # Empty response
    print("Response to send:", response)  # Debug line
    return response


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
    
