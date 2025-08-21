package com.storeapplication.services;

import com.storeapplication.models.Message;
import com.storeapplication.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public List<Message> getAllMessage() {
        return messageRepository.findAll();
    }

    public String saveMessage(Message message) {
        messageRepository.save(message);
        return "Successfully added message with id : " + message.getId();
    }

    public String deleteMessage(Long id) {
        Message msg =  messageRepository.findById(id).orElse(null);
        if (msg == null){
            return "Message with id : " + id + " not found";
        }
        messageRepository.delete(msg);
        return null;
    }
}
