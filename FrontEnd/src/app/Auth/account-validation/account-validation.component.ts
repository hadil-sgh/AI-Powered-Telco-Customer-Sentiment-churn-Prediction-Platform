import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-account-validation',
  templateUrl: './account-validation.component.html',
  styleUrls: ['./account-validation.component.scss']
})
export class AccountValidationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef>;

  // Component state
  code = '';
  countdown = 900; // 15 minutes in seconds
  timerDisplay = '15:00';
  isVerifying = false;
  isResending = false;
  canResend = false;
  allDigitsFilled = false;
  progress = 0;
  showSuccess = false;
  errorMessage = '';

  private timerSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.startTimer();
  }

  ngAfterViewInit(): void {
    // Focus on first input after view is initialized
    setTimeout(() => {
      if (this.digitInputs.first) {
        this.digitInputs.first.nativeElement.focus();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  onDigitInput(event: any, index: number): void {
    const value = event.target.value;
    const digitElements = this.digitInputs.toArray();

    // Only allow numeric input
    if (!/^\d$/.test(value)) {
      event.target.value = '';
      return;
    }

    // Move to next input if current is filled
    if (value && index < digitElements.length - 1) {
      digitElements[index + 1].nativeElement.focus();
    }

    this.updateCode();
  }

  onDigitKeydown(event: KeyboardEvent, index: number): void {
    const digitElements = this.digitInputs.toArray();
    const target = event.target as HTMLInputElement;

    // Handle backspace - move to previous input if current is empty
    if (event.key === 'Backspace' && !target.value && index > 0) {
      digitElements[index - 1].nativeElement.focus();
    }
  }

  onDigitPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    const digits = pasteData.replace(/\D/g, '').slice(0, 6);

    if (digits.length > 0) {
      const digitElements = this.digitInputs.toArray();
      
      // Fill inputs with pasted digits
      for (let i = 0; i < Math.min(digits.length, digitElements.length); i++) {
        digitElements[i].nativeElement.value = digits[i];
      }

      // Focus on the next empty input or last input
      const focusIndex = Math.min(digits.length, digitElements.length - 1);
      digitElements[focusIndex].nativeElement.focus();

      this.updateCode();
    }
  }

  private updateCode(): void {
    const digitElements = this.digitInputs.toArray();
    this.code = digitElements.map(el => el.nativeElement.value).join('');
    this.allDigitsFilled = this.code.length === 6;
    this.progress = (this.code.length / 6) * 100;
    this.errorMessage = ''; // Clear error message when user types
  }

  private startTimer(): void {
    this.countdown = 900;
    this.canResend = false;
    this.updateTimerDisplay();

    this.timerSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      this.updateTimerDisplay();

      if (this.countdown <= 0) {
        this.canResend = true;
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
      }
    });
  }

  private updateTimerDisplay(): void {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  onResendCode(): void {
    if (!this.canResend || this.isResending) return;

    this.isResending = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isResending = false;
      this.startTimer();
    }, 2000);
  }

  onVerifyAccount(): void {
    if (!this.allDigitsFilled || this.isVerifying) return;

    this.isVerifying = true;
    this.errorMessage = '';

    // Use the auth service to validate the account
    this.authService.activateAccount(this.code).subscribe({
      next: () => {
        this.showSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isVerifying = false;
        this.errorMessage = 'Invalid verification code. Please try again.';
        this.shakeInputs();
        this.clearInputs();
      }
    });
  }

  private shakeInputs(): void {
    const digitElements = this.digitInputs.toArray();
    digitElements.forEach(el => {
      el.nativeElement.classList.add('shake');
      setTimeout(() => {
        el.nativeElement.classList.remove('shake');
      }, 300);
    });
  }

  private clearInputs(): void {
    const digitElements = this.digitInputs.toArray();
    digitElements.forEach(el => {
      el.nativeElement.value = '';
    });
    this.updateCode();
    
    // Focus on first input
    setTimeout(() => {
      digitElements[0].nativeElement.focus();
    }, 300);
  }

  onContinueToDashboard(): void {
    this.router.navigate(['/Agent']);
  }
}