package com.example.virtual_travel.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChoiceDto {
    private String text;          // 선택지 문구 (예: "도톤보리 타코야키 사먹기")
    private int estimatedCost;    // 예상 비용 변화량 (예: -8000, 공짜면 0)

    public ChoiceDto() {}

    public ChoiceDto(String text, int estimatedCost) {
        this.text = text;
        this.estimatedCost = estimatedCost;
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public int getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(int estimatedCost) { this.estimatedCost = estimatedCost; }
}