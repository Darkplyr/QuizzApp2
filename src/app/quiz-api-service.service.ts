import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http"

@Injectable({
  providedIn: 'root'
})

export class QuizApiServiceService {
  private apiUrl : string = "";
  public apiToken : string = "";
  categories : any = [];
  quizzes : any = [];
  scores : any = [];
  Category = 0;
  currentIndex = 0;
  currentScore = 0;
  
  constructor(private http: HttpClient) {}

  // Call and get the questions from the API
  getQuestions() : void 
  {
    this.generateApiUrl();
    this.quizzes = [];
    this.http.get(this.apiUrl)
    .subscribe((data : any) => {
      for (let i = 0; i < data.results.length; i++) {
        let q = {
          question : decodeURIComponent(data.results[i].question),
          choices : data.results[i].incorrect_answers,
          answer : decodeURIComponent(data.results[i].correct_answer),
          difficulty : decodeURIComponent(data.results[i].difficulty),
          type : decodeURIComponent(data.results[i].type),
          question_category: decodeURIComponent(data.results[i].category)
        }
        if (q.choices.length == 1) {
          q.choices = ["True", "False"]
        }
        else {
          q.choices = this.decodeArray(q.choices);
          q.choices.splice(Math.floor(Math.random() * 4), 0, q.answer);
        }
        this.quizzes.push(q);
      }
    })
  }

  // Get the question categories 
  getCategories() : void {
    this.categories = [];
    this.http.get("https://opentdb.com/api_category.php")
    .subscribe((data : any) => {
      let c = {
        category_name : "Any Category",
        category_id : 0,
      }
      this.categories.push(c);
      for (let i = 0; i < data.trivia_categories.length; i++) {
        let c = {
          category_name : data.trivia_categories[i].name,
          category_id : data.trivia_categories[i].id,
        }
        this.categories.push(c);
      }
    })
  }

  // Decodes the special characters in an array of strings
  decodeArray(array : any) : any {
    for (let i = 0; i < array.length; i++) {
      array[i] = decodeURIComponent(array[i]);
    }
    return array;
  }

  // Creates the API URL to retrieve the questions from
  generateApiUrl() : void {
    this.generateApiToken();
    this.apiUrl = `https://opentdb.com/api.php?token=${this.apiToken}&amount=20&encode=url3986&category=${this.Category}&difficulty=0&type=0`;
  }

  // Get the API token to prevent duplicate questions
  generateApiToken() : void {
    if (this.apiToken == "") 
    {
      this.http.get("https://opentdb.com/api_token.php?command=request")
      .subscribe((data : any) => {
        if (data.response_code == 0) 
          this.apiToken = data.token;
        })
    }
  }

  // Get the scores from the Database
  getScores() : void {
    var scorecounter = 0;
    this.scores = [];
    this.http.get("https://mighty-lowlands-31094.herokuapp.com/scores")
    .subscribe((data : any) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].category_id == this.Category)
        {
          let s = {
            name : decodeURIComponent(data[i].name),
            score : data[i].score,
          }
          if (scorecounter <= 10) {
            this.scores.push(s);
            scorecounter++;
          }
          else {
            break;
          }
        }
      }
    })
  }
}