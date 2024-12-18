import json
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from booking.models import BookingRide
from users.models import User
import logging

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.booking_id = self.scope['url_route']['kwargs']['booking_id']
        self.room_group_name = f'booking_{self.booking_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        user_id = data.get('user_id')

        if message and user_id:
            user = await self.get_user(user_id)
            if user:
                await self.update_chat_field(self.booking_id, user, message)

                # Fetch the updated chat history
                updated_chat = await self.get_updated_chat(self.booking_id)

                # Broadcast the updated chat history to the room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'chat_history': updated_chat,
                    }
                )

    async def chat_message(self, event):
        chat_history = event['chat_history']

        # Send the entire chat history to the WebSocket
        await self.send(text_data=json.dumps({
            'chat_history': chat_history,
        }))

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def get_updated_chat(self, booking_id):
        try:
            booking = BookingRide.objects.get(id=booking_id)
            return json.loads(booking.chat) if booking.chat else []
        except BookingRide.DoesNotExist:
            return []

    @database_sync_to_async
    def update_chat_field(self, booking_id, user, message):
        try:
            booking = BookingRide.objects.get(id=booking_id)
            chat_data = json.loads(booking.chat) if booking.chat else []
            profile_pic = None
            if user.profile_picture:
                try:
                    profile_pic = user.profile_picture.url
                except ValueError:
                    profile_pic = None  # Handle missing file scenario

            chat_data.append({
                'user': user.email,
                'message': message,
                'timestamp': datetime.now().isoformat(),
                'profile_picture': profile_pic,
                'full_name': f"{user.first_name} {user.last_name}",
            })
            booking.chat = json.dumps(chat_data)
            booking.save()
        except BookingRide.DoesNotExist:
            logger.error(f"BookingRide with id {booking_id} does not exist.")
        except Exception as e:
            logger.error(f"An error occurred while updating chat: {e}")
