from flask import Flask, render_template, request
import openai
import os

app = Flask(__name__)

# Initialize global variables
openai.api_key = os.environ.get('apiKey')
isFirstQuery = True
chatStr = ""

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

    # Prepare messages for the chat model
    messages = [{"role": "user", "content": chatStr}]

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=200
        )
        text = response['choices'][0]['message']['content']
        chatStr += f"{text}\n"  # Persisting the assistant's response
        return text.strip()
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return "An error occurred while generating a response."


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
    app.run(debug=True)


    
