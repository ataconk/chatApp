const messageInput = document.querySelector('#message')
const MessageForm = document.querySelector('#messageForm')
const SendButton = document.querySelector('#SendButton')
const locButton = document.querySelector('#location')

const socket = io()

MessageForm.addEventListener('submit', (e) =>{
    e.preventDefault()
    
    SendButton.setAttribute('disabled','disabled')
    const myMessage = messageInput.value
    socket.emit('sendMessage', myMessage, (error)=> {
        SendButton.removeAttribute('disabled')
        messageInput.value = ''
        messageInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message Delivered')
    })

})

locButton.addEventListener('click',()=> {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {

        latitude = position.coords.latitude
        longitude = position.coords.longitude

        socket.emit('sendLocation', {latitude, longitude},(msg)=>{
            console.log(msg)
        })
        // console.log(position.coords.latitude, position.coords.longitude)
    })
})

socket.on('message', (message) => {
    console.log( message)
})

