package com.example.virtual_travel.service;

import com.example.virtual_travel.dto.TravelRequestDto;
import com.example.virtual_travel.dto.TravelResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class TravelService {

    private final WebClient grokWebClient;

    public TravelService(WebClient grokWebClient) {
        this.grokWebClient = grokWebClient;
    }

    public TravelResponseDto generateTravel(TravelRequestDto requestDto) {
        // 1. Grok API에 보낼 요청 바디(Body) 구조 만들기 (OpenAI API 호환 규격)
        Map<String, Object> requestBody = Map.of(
                "model", "grok-4.7",
                "messages", List.of(
                        Map.of("role", "system", "content", "당신은 환상적인 가상 여행 가이드입니다. 유저가 입력한 장소와 테마에 맞춰 몰입감 넘치는 여행 스토리 텍스트를 작성해주세요."),
                        Map.of("role", "user", "content", requestDto.getPrompt() + " (스타일: " + requestDto.getStyle() + ")")
                ),
                "temperature", 0.7
        );

        try {
            // 2. Grok API로 POST 요청 전송 및 응답 받기
            Map<String, Object> apiResponse = grokWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            // 3. 응답에서 텍스트 추출
            String storyText = extractTextFromResponse(apiResponse);

            // 이미지 생성
            String imageUrl = "https://picsum.photos/800/600";

            return new TravelResponseDto(storyText, imageUrl);

        } catch (Exception e) {
            e.printStackTrace();
            return new TravelResponseDto("AI와의 통신 중 오류가 발생했습니다: " + e.getMessage(), "");
        }
    }

    // API 응답 JSON에서 텍스트를 안전하게 파싱하는 헬퍼 메서드
    private String extractTextFromResponse(Map<String, Object> response) {
        try {
            if (response == null || !response.containsKey("choices")) {
                return "응답 데이터가 없습니다.";
            }

            Object choicesObj = response.get("choices");
            if (!(choicesObj instanceof List)) {
                return "응답 구조가 올바르지 않습니다.";
            }

            List<?> choices = (List<?>) choicesObj;
            if (choices.isEmpty()) {
                return "생성된 응답 결과가 없습니다.";
            }

            Object firstChoice = choices.get(0);
            if (!(firstChoice instanceof Map)) {
                return "응답 구조가 올바르지 않습니다.";
            }

            Map<?, ?> choiceMap = (Map<?, ?>) firstChoice;
            Object messageObj = choiceMap.get("message");
            if (!(messageObj instanceof Map)) {
                return "메시지 구조가 올바르지 않습니다.";
            }

            Map<?, ?> messageMap = (Map<?, ?>) messageObj;
            Object contentObj = messageMap.get("content");

            return contentObj != null ? contentObj.toString() : "내용이 비어있습니다.";

        } catch (Exception e) {
            return "응답 파싱 실패: " + e.getMessage();
        }
    }
}