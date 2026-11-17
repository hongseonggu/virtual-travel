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
    private List<ChoiceDto> choices;
    private int moneyDelta;
    private String timeUpdate;
    private String location; // 추가: 갱신된 현재 위치
    private String weather;  // 추가: 갱신된 날씨 (맑음, 비, 흐림 등)

    public TravelResponseDto(String storyText, String imageUrl, List<ChoiceDto> choices, int moneyDelta, String timeUpdate, String location, String weather) {
        this.storyText = storyText;
        this.imageUrl = imageUrl;
        this.choices = choices;
        this.moneyDelta = moneyDelta;
        this.timeUpdate = timeUpdate;
        this.location = location;
        this.weather = weather;
    }

    public String getStoryText() { return storyText; }
    public String getImageUrl() { return imageUrl; }
    public List<ChoiceDto> getChoices() { return choices; }
    public int getMoneyDelta() { return moneyDelta; }
    public String getTimeUpdate() { return timeUpdate; }
    public String getLocation() { return location; }
    public String getWeather() { return weather; }
}