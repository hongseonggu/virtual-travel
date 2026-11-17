package com.example.virtual_travel.service;

import com.example.virtual_travel.dto.ChoiceDto;
import com.example.virtual_travel.dto.TravelRequestDto;
import com.example.virtual_travel.dto.TravelResponseDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class TravelService {

    private final WebClient grokWebClient;
    private final WebClient unsplashWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String UNSPLASH_ACCESS_KEY = "S297AcUXHzFnmDrNCyF3fFJkKI6a4G4vz9hs5mF79mw";

    public TravelService(WebClient grokWebClient) {
        this.grokWebClient = grokWebClient;
        this.unsplashWebClient = WebClient.builder()
                .baseUrl("https://api.unsplash.com")
                .build();
    }

    public TravelResponseDto generateTravel(TravelRequestDto requestDto) {
        String systemPrompt = "당신은 엔화 예산으로 떠나는 리얼 일본 가상 여행 시뮬레이터의 마스터입니다.\n" +
                "유저의 [현재 상태(소지금 엔화, 시간, 위치, 날씨)]와 [이번 선택/주관식 입력]을 반영하여, 현실적인 여행 스토리를 300자 이내로 작성하세요.\n" +
                "이번 행동으로 발생한 소지금 변화량(`moneyDelta`, 지출이면 마이너스 정수, 엔화 JPY 기준), 흐른 시간(`timeUpdate`, 예: '1일차 아침', '1일차 낮', '1일차 오후', '1일차 노을 질 무렵', '1일차 저녁', '1일차 밤'), 현재 구체적인 위치(`location`), 현재 날씨(`weather`, '맑음', '흐림', '비' 중 하나)를 계산하세요.\n" +
                "💡 **중요 (이미지 키워드 규칙)**: 만약 유저의 행동이 식사, 카페 방문, 길거리 간식 취식 등 '음식'과 관련된 내용이라면, Unsplash 이미지 검색용 키워드(`keyword`)를 풍경 사진 대신 **해당 음식 사진 (예: 'japanese ramen bowl', 'fresh sushi platter', 'takoyaki street food', 'matcha dessert' 등)**으로 영문 작성하세요. 일반적인 상황이면 장소나 풍경 키워드를 쓰세요.\n" +
                "또한 다음 선택지 3개를 만들 때, 각 선택지의 엔화 예상 비용(`estimatedCost`, 지출이면 마이너스, 무료면 0)도 함께 포함하세요.\n" +
                "반드시 다른 사족 없이 아래 JSON 형식으로만 답변하세요:\n" +
                "{\n" +
                "  \"story\": \"스토리 내용\",\n" +
                "  \"keyword\": \"영문 키워드 (음식일 경우 음식 사진 키워드)\",\n" +
                "  \"choices\": [\n" +
                "    {\"text\": \"선택지1 내용\", \"estimatedCost\": -1200},\n" +
                "    {\"text\": \"선택지2 내용\", \"estimatedCost\": -300},\n" +
                "    {\"text\": \"선택지3 내용\", \"estimatedCost\": 0}\n" +
                "  ],\n" +
                "  \"moneyDelta\": -1500,\n" +
                "  \"timeUpdate\": \"1일차 오후\",\n" +
                "  \"location\": \"오사카 난바 라멘집\",\n" +
                "  \"weather\": \"맑음\"\n" +
                "}";

        String userMessage;
        if (requestDto.getPreviousStory() == null || requestDto.getPreviousStory().isEmpty()) {
            userMessage = "여행 시작 프롬프트 (초기 예산 엔화): " + requestDto.getPrompt();
        } else {
            userMessage = "[현재 소지금]: " + requestDto.getCurrentMoney() + "엔\n" +
                    "[현재 시간]: " + requestDto.getCurrentTime() + "\n" +
                    "[현재 위치]: " + requestDto.getCurrentLocation() + "\n" +
                    "[현재 날씨]: " + requestDto.getCurrentWeather() + "\n" +
                    "[이전 스토리]: " + requestDto.getPreviousStory() + "\n" +
                    "[유저의 선택/행동]: " + requestDto.getPrompt();
        }

        Map<String, Object> requestBody = Map.of(
                "model", "grok-4.7",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "temperature", 0.7
        );

        try {
            Map<String, Object> apiResponse = grokWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String contentJson = extractTextFromResponse(apiResponse);

            String storyText;
            String imageKeyword;
            List<ChoiceDto> choices;
            int moneyDelta = 0;
            String timeUpdate = requestDto.getCurrentTime() != null ? requestDto.getCurrentTime() : "1일차 낮";
            String location = requestDto.getCurrentLocation() != null ? requestDto.getCurrentLocation() : "일본 현지";
            String weather = requestDto.getCurrentWeather() != null ? requestDto.getCurrentWeather() : "맑음";

            try {
                String cleanedJson = contentJson.replaceAll("```json", "").replaceAll("```", "").trim();
                Map<String, Object> parsedContent = objectMapper.readValue(cleanedJson, Map.class);

                storyText = (String) parsedContent.getOrDefault("story", contentJson);
                imageKeyword = (String) parsedContent.getOrDefault("keyword", "japan,food");

                Object rawChoices = parsedContent.get("choices");
                if (rawChoices != null) {
                    choices = objectMapper.convertValue(rawChoices, new TypeReference<List<ChoiceDto>>() {});
                } else {
                    choices = List.of(
                            new ChoiceDto("주변 거리 구경하기", 0),
                            new ChoiceDto("편의점 간식 사먹기", -500),
                            new ChoiceDto("근처 식당 들어가기", -1500)
                    );
                }

                Object deltaObj = parsedContent.get("moneyDelta");
                if (deltaObj instanceof Number) {
                    moneyDelta = ((Number) deltaObj).intValue();
                }

                timeUpdate = (String) parsedContent.getOrDefault("timeUpdate", timeUpdate);
                location = (String) parsedContent.getOrDefault("location", location);
                weather = (String) parsedContent.getOrDefault("weather", weather);

            } catch (Exception e) {
                storyText = contentJson;
                imageKeyword = "japan,travel";
                choices = List.of(
                        new ChoiceDto("주변 거리 구경하기", 0),
                        new ChoiceDto("편의점 간식 사먹기", -500),
                        new ChoiceDto("근처 식당 들어가기", -1500)
                );
            }

            String imageUrl = fetchImageUrlFromUnsplash(imageKeyword);

            return new TravelResponseDto(storyText, imageUrl, choices, moneyDelta, timeUpdate, location, weather);

        } catch (Exception e) {
            e.printStackTrace();
            return new TravelResponseDto(
                    "AI 통신 오류가 발생했습니다: " + e.getMessage(),
                    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
                    List.of(new ChoiceDto("다시 시도하기", 0)),
                    0,
                    "1일차 낮",
                    "일본 현지",
                    "맑음"
            );
        }
    }

    private String fetchImageUrlFromUnsplash(String keyword) {
        try {
            Map<?, ?> response = unsplashWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/photos/random")
                            .queryParam("query", keyword)
                            .queryParam("client_id", UNSPLASH_ACCESS_KEY)
                            .queryParam("orientation", "landscape")
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("urls")) {
                Map<?, ?> urls = (Map<?, ?>) response.get("urls");
                return (String) urls.get("regular");
            }
        } catch (Exception e) {
            System.out.println("Unsplash API 호출 실패 또는 한도 초과: " + e.getMessage());
        }
        return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80";
    }

    private String extractTextFromResponse(Map<String, Object> response) {
        try {
            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> choiceMap = (Map<?, ?>) choices.get(0);
            Map<?, ?> messageMap = (Map<?, ?>) choiceMap.get("message");
            return messageMap.get("content").toString();
        } catch (Exception e) {
            return "응답 파싱 실패";
        }
    }
}