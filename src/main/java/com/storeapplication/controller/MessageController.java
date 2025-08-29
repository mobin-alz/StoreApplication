package com.storeapplication.controller;

import com.storeapplication.dto.request.MessageRequestDto;
import com.storeapplication.dto.response.BaseResponse;
import com.storeapplication.models.Message;
import com.storeapplication.services.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    public Message DtoToEntity(MessageRequestDto messageRequestDto) {
        Message message = new Message();
        message.setFirstName(messageRequestDto.getFirstName());
        message.setLastName(messageRequestDto.getLastName());
        message.setEmail(messageRequestDto.getEmail());
        message.setPhoneNumber(messageRequestDto.getPhoneNumber());
        message.setTitle(messageRequestDto.getTitle());
        message.setMessage(messageRequestDto.getMessage());
        return message;
    }

    @Operation(summary = "find by status")
    @GetMapping("/{status}")
    public ResponseEntity<?> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(messageService.getMessageByStatus(status));
    }


    @GetMapping
    public ResponseEntity<?> getAllMessages() {
        List<Message> messages = messageService.getAllMessage();
        if (messages.isEmpty()) {
            return ResponseEntity.status(404).body("No messages found");
        }
        return ResponseEntity.ok(messages);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse> DeleteMessage(@PathVariable Long id) {
        String msg = messageService.deleteMessage(id);
        if (msg != null) {
            return ResponseEntity.status(400).body(new BaseResponse(msg, false));
        }
        return ResponseEntity.status(200).body(new BaseResponse("Successfully Deleted Message with id : " + id, true));

    }


    @PostMapping
    public ResponseEntity<BaseResponse> CreateMessage(@RequestBody MessageRequestDto messageRequestDto) {
        Message message = DtoToEntity(messageRequestDto);
        String msg = messageService.saveMessage(message);
        return ResponseEntity.status(200).body(new BaseResponse(msg, true));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse> UpdateMessage(@PathVariable Long id) {
        String msg = messageService.updateMessage(id);
        if (msg == null) {
            return ResponseEntity.status(200).body(new BaseResponse("message status changed to approve status.", true));
        }
        return ResponseEntity.status(400).body(new BaseResponse(msg, false));
    }

}

