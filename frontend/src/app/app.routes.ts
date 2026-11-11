import { Routes } from '@angular/router';
import { LeaderboardComponent } from './ranking/components/leaderboard/leaderboard.component';
import { RankingPageComponent } from './ranking/components/ranking-page/ranking-page.component';
import { ScorePageComponent } from './ranking/components/score-page/score-page.component';
import { AdminPanelComponent } from './administration/components/admin-panel/admin-panel.component';
import { DeveloperDetailsComponent } from './ranking/components/developer-details/developer-details.component';
import { FeedPageComponent } from './feed/components/feed-page/feed-page.component';
import { OAuthRedirectComponent } from './auth/oauth-redirect/oauth-redirect.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'ranking', pathMatch: 'full' },
  { path: 'ranking', component: RankingPageComponent, canActivate: [authGuard] },
  { path: 'commits', component: LeaderboardComponent, canActivate: [authGuard] },
  { path: 'feed', component: FeedPageComponent, canActivate: [authGuard] },
  { path: 'score', component: ScorePageComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [authGuard] },
  { path: 'dev/:username', component: DeveloperDetailsComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'oauth2/redirect', component: OAuthRedirectComponent },
  { path: '**', redirectTo: 'ranking' }
];

