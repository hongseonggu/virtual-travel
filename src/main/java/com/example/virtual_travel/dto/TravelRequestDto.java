package com.example.virtual_travel.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class TravelRequestDto {
    private String prompt;          // 초기 입력 또는 주관식 입력
    private String previousStory;   // 직전까지 진행된 스토리 맥락 (선택지 진행 시 사용)

    // getters and setters
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }

    public String getPreviousStory() { return previousStory; }
    public void setPreviousStory(String previousStory) { this.previousStory = previousStory; }
}