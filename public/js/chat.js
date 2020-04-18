const messageInput = document.querySelector('#message')
const MessageForm = document.querySelector('#messageForm')
const SendButton = document.querySelector('#SendButton')
const locButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')


const locTemplate = document.querySelector('#loc-template').innerHTML
const messageTemplate = document.querySelector('#message-template').innerHTML

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

    locButton.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position) => {

        latitude = position.coords.latitude
        longitude = position.coords.longitude

        socket.emit('sendLocation', {latitude, longitude},()=>{
            locButton.removeAttribute('disabled')

            // console.log(msg)
        })
        // console.log(position.coords.latitude, position.coords.longitude)
    })
})

socket.on('message', (message) => {
    console.log( message)
    const html = Mustache.render(messageTemplate, {message} )
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage', (url) => {
    console.log( url)
    const html = Mustache.render(locTemplate, {url})
    $messages.insertAdjacentHTML('beforeend',html)
})

