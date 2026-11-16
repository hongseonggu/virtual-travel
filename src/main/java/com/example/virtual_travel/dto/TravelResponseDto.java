package com.example.virtual_travel.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class TravelResponseDto {
    private String storyText;
    private String imageUrl;
    private List<String> choices; // AI가 추천해 주는 다음 선택지 3개

    public TravelResponseDto(String storyText, String imageUrl, List<String> choices) {
        this.storyText = storyText;
        this.imageUrl = imageUrl;
        this.choices = choices;
    }

    // getters and setters
    public String getStoryText() { return storyText; }
    public String getImageUrl() { return imageUrl; }
    public List<String> getChoices() { return choices; }
}